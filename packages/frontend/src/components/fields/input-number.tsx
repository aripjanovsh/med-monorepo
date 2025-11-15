import { Input } from "@/components/ui/input";
import { ComponentProps, forwardRef, useEffect } from "react";
import { useIMask } from "react-imask";

export interface InputNumberProps
  extends Omit<ComponentProps<typeof Input>, "onChange" | "onInput"> {
  onChange?: (value: number) => void;
  onInput?: (value: number) => void;
}

export const InputNumber = (props: InputNumberProps) => {
  const { value: maskValue, setValue } = useIMask(
    {
      mask: Number,
      scale: 0, // Целое число
      thousandsSeparator: " ", // Разделитель тысяч
      padFractionalZeros: false, // Не добавлять нули после запятой
      normalizeZeros: true, // Нормализовать нули
      radix: ".", // Разделитель дробной части (не используется, так как scale: 0)
      mapToRadix: ["."], // Маппинг для разделителя дробной части
    },
    {
      onAccept: (value) => {
        const cleanNumber = value.replace(/[,\s]/g, "");

        if (props.onChange) props.onChange(Number(cleanNumber));
        if (props.onInput) props.onInput(Number(cleanNumber));
      },
    },
  );

  // Синхронизируем внешнее значение с маской
  useEffect(() => {
    if (props.value !== undefined) {
      setValue(String(props.value));
    }
  }, [props.value, setValue]);

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={maskValue}
      {...props}
      onChange={undefined}
      onInput={undefined}
    />
  );
};
