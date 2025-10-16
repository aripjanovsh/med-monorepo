import { FC } from "react";
import { useIMask } from "react-imask";
import { Field, FieldProps } from "@/components/fields/field";
import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { forwardRef, useEffect } from "react";

/**
 * PhoneField компонент для ввода узбекского номера телефона с маской
 * Автоматически форматирует ввод в формате: +998 XX XXX XX XX
 * В onChange возвращает чистый номер без пробелов: +998XXXXXXXXX
 */
export interface PhoneFieldProps extends FieldProps {
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const PhoneField = forwardRef<HTMLInputElement, PhoneFieldProps>(
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
    ref
  ) => {
    const {
      ref: maskRef,
      value: maskValue,
      setValue,
    } = useIMask(
      {
        mask: "+998 00 000 00 00",
        lazy: true,
        placeholderChar: " ",
        definitions: {
          "0": /[0-9]/,
        },
        prepare: (str: string) => {
          if (str === "+998") return str;
          return str;
        },
      },
      {
        onAccept: (value) => {
          if (onChange) {
            // Убираем все пробелы из значения
            const cleanNumber = value.replace(/\s/g, "");
            onChange(cleanNumber);
          }
        },
      }
    );

    // Синхронизируем внешнее значение с маской
    useEffect(() => {
      if (value !== undefined) {
        setValue(value);
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
            type="tel"
            disabled={disabled}
            value={maskValue}
            onChange={() => {}}
            {...props}
          />
        </FormControl>
      </Field>
    );
  }
);

PhoneField.displayName = "PhoneField";
