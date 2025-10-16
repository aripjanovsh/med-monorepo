import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { LocationType, Prisma } from "@prisma/client";
import {
  CreateLocationDto,
  UpdateLocationDto,
  FindAllLocationsDto,
  SuggestLocationsDto,
  LocationResponseDto,
} from "./dto";
import { buildSearchTokens } from "../../../common/utils/transliteration.util";
import { plainToInstance } from "class-transformer";
import { PaginatedResponseDto } from "@/common/dto/pagination.dto";

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto) {
    const { parentId, ...locationData } = createLocationDto;

    // Validate parent exists if parentId is provided
    if (parentId) {
      const parent = await this.prisma.location.findUnique({
        where: { id: parentId, isActive: true },
      });
      if (!parent) {
        throw new BadRequestException("Parent location not found or inactive");
      }
    }

    // Validate hierarchy rules
    await this.validateLocationHierarchy(createLocationDto.type, parentId);

    // Compute searchField based on name/code and parent name (if any)
    const parent = parentId
      ? await this.prisma.location.findUnique({ where: { id: parentId } })
      : null;
    const searchField = this.buildSearchField(
      locationData.name,
      locationData.code,
      parent?.name
    );

    const location = await this.prisma.location.create({
      data: {
        ...locationData,
        parentId,
        searchField,
      },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: [{ weight: "asc" }, { name: "asc" }],
        },
      },
    });

    return plainToInstance(LocationResponseDto, location);
  }

  async findAll(
    query: FindAllLocationsDto
  ): Promise<PaginatedResponseDto<LocationResponseDto>> {
    const {
      search,
      type,
      parentId,
      isActive = true,
      includeParent = false,
      includeChildren = false,
      page = 1,
      limit = 10,
      sortBy = "weight",
      sortOrder = "asc",
    } = query;

    const where: Prisma.LocationWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { searchField: { contains: search.toLowerCase() } },
      ];
    }

    if (type !== undefined) {
      where.type = type;
    }

    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const include: Prisma.LocationInclude = {};
    if (includeParent) {
      include.parent = true;
    }
    if (includeChildren) {
      include.children = {
        where: { isActive: true },
        orderBy: [{ weight: "asc" }, { name: "asc" }],
      };
    }

    const [locations, total] = await Promise.all([
      this.prisma.location.findMany({
        where,
        include,
        orderBy: [{ weight: "asc" }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.location.count({ where }),
    ]);

    return {
      data: locations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async suggest(query: SuggestLocationsDto) {
    const q: string = (query.q ?? "").trim();
    if (!q) return [];
    const where: Prisma.LocationWhereInput = {
      OR: [
        { searchField: { contains: q.toLowerCase() } },
        { name: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
      isActive: true,
    };

    if (query.type) {
      where.type = query.type;
    } else {
      where.type = {
        in: [LocationType.REGION, LocationType.CITY, LocationType.DISTRICT],
      };
    }

    const items = await this.prisma.location.findMany({
      where,
      include: {
        parent: {
          include: {
            parent: {
              include: {
                parent: true,
              },
            },
          },
        },
      },
      orderBy: [{ weight: "asc" }, { name: "asc" }],
      take: query.limit,
    });

    return plainToInstance(LocationResponseDto, items);
  }

  private buildSearchField(
    name: string,
    code?: string,
    parentName?: string
  ): string {
    return buildSearchTokens([name, code, parentName]);
  }

  private async recomputeSearchFieldForSubtree(rootId: string): Promise<void> {
    // Load minimal fields for all nodes to compute parent-child chains
    const all = await this.prisma.location.findMany({
      select: { id: true, name: true, code: true, parentId: true },
      orderBy: [{ weight: "asc" }, { name: "asc" }],
    });
    const byId: Record<
      string,
      { id: string; name: string; code: string | null; parentId: string | null }
    > = Object.fromEntries(all.map((n) => [n.id, n] as const));
    const childrenMap: Record<string, string[]> = {};
    for (const n of all) {
      const pid = n.parentId ?? "__root__";
      (childrenMap[pid] ??= []).push(n.id);
    }

    const computeFor = async (id: string): Promise<void> => {
      const node = byId[id];
      const parent = node?.parentId ? byId[node.parentId] : undefined;
      const searchField = this.buildSearchField(
        node?.name ?? "",
        node?.code ?? undefined,
        parent?.name
      );
      await this.prisma.location.update({
        where: { id },
        data: { searchField },
      });
      for (const childId of childrenMap[id] ?? []) {
        await computeFor(childId);
      }
    };

    await computeFor(rootId);
  }

  async findOne(id: string, includeRelations: boolean = true) {
    const include: Prisma.LocationInclude = includeRelations
      ? {
          parent: true,
          children: {
            where: { isActive: true },
            orderBy: [{ weight: "asc" }, { name: "asc" }],
          },
        }
      : {};

    const location = await this.prisma.location.findUnique({
      where: { id },
      include,
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    return plainToInstance(LocationResponseDto, location);
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    const existingLocation = await this.findOne(id, false);
    const { parentId, type, ...locationData } = updateLocationDto;

    // Validate parent exists if parentId is being changed
    if (parentId !== undefined && parentId !== existingLocation.parentId) {
      if (parentId) {
        const parent = await this.prisma.location.findUnique({
          where: { id: parentId, isActive: true },
        });
        if (!parent) {
          throw new BadRequestException(
            "Parent location not found or inactive"
          );
        }
      }

      // Prevent circular reference
      if (parentId === id) {
        throw new BadRequestException("Location cannot be its own parent");
      }

      // Check if the new parent is not a descendant of this location
      if (parentId) {
        const isDescendant = await this.isDescendant(id, parentId);
        if (isDescendant) {
          throw new BadRequestException(
            "Cannot set parent: would create circular reference"
          );
        }
      }
    }

    // Validate hierarchy rules if type or parent is changing
    if (type !== undefined || parentId !== undefined) {
      const newType = type ?? existingLocation.type;
      const newParentId =
        parentId !== undefined ? parentId : existingLocation.parentId;
      await this.validateLocationHierarchy(newType, newParentId);
    }
    // Compute updated searchField for this node
    const newParentId =
      parentId !== undefined ? parentId : existingLocation.parentId;
    const parent = newParentId
      ? await this.prisma.location.findUnique({ where: { id: newParentId } })
      : null;
    const searchField = this.buildSearchField(
      locationData.name ?? existingLocation.name,
      locationData.code ?? existingLocation.code ?? undefined,
      parent?.name
    );

    const updated = await this.prisma.location.update({
      where: { id },
      data: {
        ...locationData,
        ...(parentId !== undefined && { parentId }),
        ...(type !== undefined && { type }),
        searchField,
      },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: [{ weight: "asc" }, { name: "asc" }],
        },
      },
    });

    // Recompute subtree search fields if name or parent changed
    const nameChanged =
      locationData.name && locationData.name !== existingLocation.name;
    const parentChanged =
      parentId !== undefined && parentId !== existingLocation.parentId;
    if (nameChanged || parentChanged) {
      await this.recomputeSearchFieldForSubtree(id);
    }

    return plainToInstance(LocationResponseDto, updated);
  }

  async remove(id: string) {
    const location = await this.findOne(id, true);

    // Check if location has active children
    const hasActiveChildren = location.children && location.children.length > 0;
    if (hasActiveChildren) {
      throw new BadRequestException(
        "Cannot delete location that has active child locations"
      );
    }

    return this.prisma.location.delete({
      where: { id },
    });
  }

  async toggleStatus(id: string) {
    const location = await this.findOne(id, false);

    return this.prisma.location.update({
      where: { id },
      data: {
        isActive: !location.isActive,
      },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: [{ weight: "asc" }, { name: "asc" }],
        },
      },
    });
  }

  async findLocationTree() {
    // Get all active locations and build tree structure
    const locations = await this.prisma.location.findMany({
      where: { isActive: true },
      orderBy: [{ weight: "asc" }, { name: "asc" }],
    });

    // Build hierarchical tree structure
    return this.buildLocationTree(locations);
  }

  private buildLocationTree(
    locations: any[],
    parentId: string | null = null
  ): any[] {
    const children = locations.filter(
      (location) => location.parentId === parentId
    );

    return children.map((location) => ({
      ...location,
      children: this.buildLocationTree(locations, location.id),
    }));
  }

  private async validateLocationHierarchy(
    type: LocationType,
    parentId: string | null
  ) {
    if (!parentId) {
      // Only COUNTRY type can be root (no parent)
      if (type !== LocationType.COUNTRY) {
        throw new BadRequestException(
          "Only countries can be root locations (no parent)"
        );
      }
      return;
    }

    const parent = await this.prisma.location.findUnique({
      where: { id: parentId },
    });

    if (!parent) {
      throw new BadRequestException("Parent location not found");
    }

    // Validate hierarchy rules
    const validHierarchies = {
      [LocationType.REGION]: [LocationType.COUNTRY],
      [LocationType.CITY]: [LocationType.REGION],
      [LocationType.DISTRICT]: [LocationType.CITY, LocationType.REGION], // Districts can be under cities or directly under regions (like Tashkent)
    };

    const allowedParentTypes = validHierarchies[type];
    if (!allowedParentTypes || !allowedParentTypes.includes(parent.type)) {
      throw new BadRequestException(
        `Invalid hierarchy: ${type} cannot be child of ${parent.type}`
      );
    }
  }

  private async isDescendant(
    ancestorId: string,
    locationId: string
  ): Promise<boolean> {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location || !location.parentId) {
      return false;
    }

    if (location.parentId === ancestorId) {
      return true;
    }

    return this.isDescendant(ancestorId, location.parentId);
  }
}
