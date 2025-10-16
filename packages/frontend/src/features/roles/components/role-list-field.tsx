import { get, map } from "lodash";
import { useGetRolesQuery } from "@/features/roles/role.api";
import { ListField, ListFieldProps } from "@/components/fields/list-field";

export type RoleListFieldProps = Omit<ListFieldProps, "options">;

export function RoleListField({ ...props }: RoleListFieldProps) {
  const { data } = useGetRolesQuery({});

  const roles = get(data, "data", []);

  const options = map(roles, (role) => ({
    label: role.name,
    value: role.id,
  }));

  return (
    <ListField
      {...props}
      options={options}
      value={props.value}
      onChange={props.onChange}
    />
  );
}
