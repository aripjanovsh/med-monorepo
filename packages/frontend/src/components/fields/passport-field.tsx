import { FC } from "react";
import { useIMask } from "react-imask";
import { Field, FieldProps } from "@/components/fields/field";
import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forwardRef, useEffect } from "react";

/**
 * PassportField компонент для ввода серии и номера паспорта с маской
 * Автоматически форматирует ввод в формате: AA 1234567
 * В onChange возвращает значение в формате: AA1234567 (без пробела)
 */
export interface PassportFieldProps extends FieldProps {
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const PassportField = forwardRef<HTMLInputElement, PassportFieldProps>(
  (
    {
      className,
      label,
      labelClassName,
      hint,
      hintClassName,
      labelHint,
      labelHintClassName,
      disabled,
      onChange,
      value,
      ...props
    },
    ref,
  ) => {
    const {
      ref: maskRef,
      value: maskValue,
      setValue,
    } = useIMask(
      {
        mask: "aa 0000000",
        lazy: false,
        placeholderChar: "_",
        definitions: {
          a: /[A-Za-zА-Яа-я]/,
          "0": /[0-9]/,
        },
        prepare: (str: string) => {
          // Преобразуем в верхний регистр
          return str.toUpperCase();
        },
      },
      {
        onAccept: (value) => {
          if (onChange) {
            // Убираем пробел из значения для отправки на сервер
            const cleanValue = value.replace(/\s/g, "");
            onChange(cleanValue);
          }
        },
      },
    );

    // Синхронизируем внешнее значение с маской
    useEffect(() => {
      if (value !== undefined) {
        // Добавляем пробел обратно для отображения в маске
        const formattedValue =
          value.length > 2 ? `${value.slice(0, 2)} ${value.slice(2)}` : value;
        setValue(formattedValue);
      }
    }, [value, setValue]);

    return (
      <Field
        {...{
          className,
          label,
          labelClassName,
          hint,
          hintClassName,
          labelHint,
          labelHintClassName,
        }}
      >
        <FormControl>
          {/* 
          Используем пустой onChange для Input, так как все изменения 
          обрабатываются через IMask onAccept
        */}
          <Input
            ref={(node) => {
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              maskRef.current = node;
            }}
            type="text"
            disabled={disabled}
            value={maskValue}
            onChange={() => {}}
            {...props}
          />
        </FormControl>
      </Field>
    );
  },
);

PassportField.displayName = "PassportField";
