import { rootApi } from "@/store/api/root.api";
import { API_TAG_OPERATIONS_FILES } from "@/constants/api-tags.constants";
import type {
  FileResponseDto,
  FileQueryDto,
  UploadFileDto,
  UpdateFileDto,
} from "./file.dto";
import { API_ENDPOINT } from "@/constants/app.constants";

export const fileApi = rootApi.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    /**
     * Загрузить файл
     */
    uploadFile: builder.mutation<
      FileResponseDto,
      { file: File; dto: UploadFileDto }
    >({
      query: ({ file, dto }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", dto.category);

        if (dto.title) {
          formData.append("title", dto.title);
        }

        if (dto.description) {
          formData.append("description", dto.description);
        }

        if (dto.entityType) {
          formData.append("entityType", dto.entityType);
        }

        if (dto.entityId) {
          formData.append("entityId", dto.entityId);
        }

        return {
          url: "/api/v1/files/upload",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [API_TAG_OPERATIONS_FILES],
    }),

    /**
     * Получить список файлов
     */
    getFiles: builder.query<
      { data: FileResponseDto[]; total: number },
      FileQueryDto
    >({
      query: (params) => ({
        url: "/api/v1/files",
        method: "GET",
        params,
      }),
      providesTags: [API_TAG_OPERATIONS_FILES],
    }),

    /**
     * Получить файл по ID
     */
    getFileById: builder.query<FileResponseDto, string>({
      query: (id) => ({
        url: `/api/v1/files/${id}`,
        method: "GET",
      }),
      providesTags: [API_TAG_OPERATIONS_FILES],
    }),

    /**
     * Обновить метаданные файла
     */
    updateFile: builder.mutation<
      FileResponseDto,
      { id: string; dto: UpdateFileDto }
    >({
      query: ({ id, dto }) => ({
        url: `/api/v1/files/${id}`,
        method: "PATCH",
        body: dto,
      }),
      invalidatesTags: [API_TAG_OPERATIONS_FILES],
    }),

    /**
     * Удалить файл
     */
    deleteFile: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/files/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [API_TAG_OPERATIONS_FILES],
    }),
  }),
});

export const {
  useUploadFileMutation,
  useGetFilesQuery,
  useGetFileByIdQuery,
  useUpdateFileMutation,
  useDeleteFileMutation,
} = fileApi;

/**
 * Вспомогательные функции для работы с файлами
 */
export const fileHelpers = {
  /**
   * Получить URL для скачивания файла
   */
  getDownloadUrl: (id: string): string => {
    return API_ENDPOINT + `/api/v1/files/${id}/download`;
  },

  /**
   * Загрузить файл как Blob с авторизацией
   */
  fetchFileBlob: async (id: string, token: string): Promise<Blob> => {
    const url = fileHelpers.getDownloadUrl(id);
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    return await response.blob();
  },

  /**
   * Создать Blob URL из файла
   */
  createBlobUrl: async (id: string, token: string): Promise<string> => {
    const blob = await fileHelpers.fetchFileBlob(id, token);
    return URL.createObjectURL(blob);
  },

  /**
   * Освободить Blob URL
   */
  revokeBlobUrl: (url: string): void => {
    URL.revokeObjectURL(url);
  },

  /**
   * Скачать файл с авторизацией
   */
  downloadFile: async (id: string, filename: string, token: string): Promise<void> => {
    try {
      const blob = await fileHelpers.fetchFileBlob(id, token);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Очистка Blob URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  },
};
