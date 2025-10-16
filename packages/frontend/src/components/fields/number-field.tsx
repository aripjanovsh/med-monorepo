import { Field, FieldProps } from '@/components/fields/field';
import { FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import * as React from 'react';
import { forwardRef, useEffect } from 'react';
import { useIMask } from 'react-imask';

/**
 * NumberField компонент для ввода чисел с форматированием тысяч
 * Автоматически форматирует ввод в формате: 1,000,000
 * В onChange возвращает чистое число без разделителей: 1000000
 */
export interface NumberFieldProps extends FieldProps {
  disabled?: boolean;
  placeholder?: string;
  value?: number;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onChange?: (value: number) => void;
}

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
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
      value,
      onChange,
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
        mask: Number,
        scale: 0, // Целое число
        thousandsSeparator: ' ', // Разделитель тысяч
        padFractionalZeros: false, // Не добавлять нули после запятой
        normalizeZeros: true, // Нормализовать нули
        radix: '.', // Разделитель дробной части (не используется, так как scale: 0)
        mapToRadix: ['.'], // Маппинг для разделителя дробной части
      },
      {
        onAccept: (value) => {
          if (onChange) {
            // Убираем все разделители тысяч из значения
            const cleanNumber = value.replace(/[,\s]/g, '');
            onChange(Number(cleanNumber));
          }
        },
      },
    );

    // Синхронизируем внешнее значение с маской
    useEffect(() => {
      if (value !== undefined) {
        setValue(String(value));
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
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              maskRef.current = node;
            }}
            type="text" // Изменяем тип на text, чтобы избежать встроенной валидации чисел
            inputMode="numeric" // Указываем, что ввод должен быть числовым
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
