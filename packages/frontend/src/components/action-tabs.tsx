import { Button } from "@/components/ui/button";

interface ActionTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string }[];
}

export const ActionTabs = ({
  value,
  onValueChange,
  items,
}: ActionTabsProps) => {
  return (
    <div className="-mx-6 mb-6">
      <div className="inline-flex items-center justify-start border-b rounded-none gap-2 w-full h-9 px-4">
        {items.map((item) => (
          <button
            key={item.value}
            data-state={value === item.value ? "active" : "inactive"}
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-normal transition-all disabled:pointer-events-none data-[state=active]:text-foreground px-2 py-1 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gap-2 text-muted-foreground disabled:opacity-50 rounded-md data-[state=active]:text-primary font-medium relative hover:bg-muted font-gilroy font-semibold data-[state=active]:[&>div]:block  "
            value={item.value}
            onClick={() => onValueChange(item.value)}
          >
            <div
              aria-hidden="true"
              className="rounded-t-2xl absolute -bottom-[4px] h-[2px] bg-primary data-[state=active]:block hidden left-2 right-2"
            />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
