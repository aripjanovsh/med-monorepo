import { get, map } from "lodash";
import { useGetServiceTypesQuery } from "@/features/master-data/master-data-service-types.api";
import { ListField, ListFieldProps } from "@/components/fields/list-field";

export type ServiceTypeListFieldProps = Omit<ListFieldProps, "options">;

export function ServiceTypeListField({ ...props }: ServiceTypeListFieldProps) {
  const { data } = useGetServiceTypesQuery({});

  const serviceTypes = get(data, "data", []);

  const options = map(serviceTypes, (serviceType) => ({
    label: serviceType.name,
    value: serviceType.id,
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
