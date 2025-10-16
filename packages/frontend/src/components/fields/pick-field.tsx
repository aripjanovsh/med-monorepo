import { ModalContentProps, useDialog } from '@/components/providers/dialog.provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { filter, find, get, isEmpty, map } from 'lodash-es';
import { ChevronsUpDownIcon, X } from 'lucide-react';
import { ComponentProps, FormEvent, MouseEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface PickFieldOption {
  label: string;
  value: string;
}

export interface PickFieldProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  value?: PickFieldOption[];
  options?: PickFieldOption[];
  single?: boolean;
  canAdd?: boolean;
  placeholder?: string;
  onChange?: (value: PickFieldOption[]) => void;
}

export function PickField({
  className,
  value = [],
  options: defaultOptions = [],
  single,
  canAdd,
  placeholder,
  onChange,
}: PickFieldProps) {
  const [openDialog] = useDialog(PickFieldDialog);
  const [options, setOption] = useState<PickFieldOption[]>([]);

  useEffect(() => {
    setOption(defaultOptions);
  }, [defaultOptions]);

  const handleChange = (options: PickFieldOption[]) => {
    if (onChange) onChange(options);

    setOption((prev) => {
      const map = new Map<string, PickFieldOption>();

      [...prev, ...options].forEach((option) => {
        map.set(option.value, option);
      });

      return Array.from(map.values());
    });
  };

  const handleOpen = () => {
    openDialog({
      title: placeholder,
      value,
      options,
      single,
      canAdd,
      onSubmit: handleChange,
    });
  };

  const handleRemove = (optionValue: string, e: MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const newValue = value.filter((v) => v.value !== optionValue);
    handleChange(newValue);
  };

  const renderValues = () => {
    if (!isEmpty(value) && get(value, [0, 'value'])) {
      if (single) return get(value, [0, 'label']);

      return map(value, (option) => (
        <Badge key={option.value} variant="outline" className="gap-1 pr-1">
          {option.label}
          <span
            onClick={(e) => handleRemove(option.value, e)}
            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground p-0.5 rounded transition-colors"
          >
            <X size={12} />
          </span>
        </Badge>
      ));
    }

    return placeholder || 'Select';
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Button
        onClick={handleOpen}
        variant="outline"
        type="button"
        className={cn([
          'flex flex-wrap gap-[2px] w-full font-normal text-left items-center justify-start min-h-9 relative',
          !isEmpty(value) && !single && 'py-1 pl-1 h-auto hover:bg-background',
        ])}
      >
        {renderValues()}
        <ChevronsUpDownIcon className="ml-auto" />
      </Button>
    </div>
  );
}

interface PickFieldDialogProps extends ModalContentProps {
  title?: string;
  value?: PickFieldOption[];
  options?: PickFieldOption[];
  single?: boolean;
  canAdd?: boolean;
  onSubmit?: (value: PickFieldOption[]) => void;
}

export function PickFieldDialog({
  open,
  setOpen,
  closeModal,
  title,
  value = [],
  single = false,
  canAdd = false,
  options: defaultOptions = [],
  onSubmit,
}: PickFieldDialogProps) {
  const { t } = useTranslation();
  const [options, setOption] = useState<PickFieldOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<PickFieldOption[]>([]);
  const [newOption, setNewOption] = useState<string>('');

  useEffect(() => {
    setSelectedOptions(value);
  }, [value]);

  useEffect(() => {
    setOption(defaultOptions);
  }, [defaultOptions]);

  const handleSubmit = () => {
    if (onSubmit) onSubmit(selectedOptions);
    closeModal();
  };

  const handleSubmitForm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleSelectMultiple = (option: PickFieldOption, checked: boolean | 'indeterminate') => {
    setSelectedOptions((prev) => {
      const options = filter(prev, (o) => o.value !== option.value);
      if (checked) return [...options, option];
      else return options;
    });
  };

  const handleSelectSingle = (value: PickFieldOption['value']) => {
    const option = find(options, (o) => o.value === value);
    if (option) setSelectedOptions([option]);
  };

  const handleAdd = () => {
    if (!newOption) return;

    const isExist = find(
      options,
      (option) => option.label.toLowerCase() === newOption.toLowerCase(),
    );

    if (isExist) {
      setNewOption('');
      return;
    }

    const id = crypto.randomUUID();
    const newOptions = { label: newOption, value: id };

    setOption((prev) => {
      return [...prev, newOptions];
    });

    setSelectedOptions((prev) => {
      if (single) return [newOptions];
      return [...prev, newOptions];
    });

    setNewOption('');
  };

  const renderMultiple = () => {
    return map(options, (option) => (
      <div className="flex items-center gap-x-2" key={option.value}>
        <Checkbox
          onCheckedChange={(checked) => handleSelectMultiple(option, checked)}
          checked={!!find(selectedOptions, (o) => o.value === option.value)}
          id={`option-${option.value}`}
        />
        <Label htmlFor={`option-${option.value}`}>{option.label}</Label>
      </div>
    ));
  };

  const renderSingle = () => {
    return (
      <RadioGroup
        onValueChange={handleSelectSingle}
        defaultValue={selectedOptions && selectedOptions[0] ? selectedOptions[0]['value'] : ''}
      >
        {map(options, ({ label, value }) => (
          <div className="flex items-center gap-x-2" key={value}>
            <RadioGroupItem
              value={value}
              checked={!!find(selectedOptions, (option) => option.value === value)}
              id={`option-${value}`}
            />
            <Label htmlFor={`option-${value}`}>{label}</Label>
          </div>
        ))}
      </RadioGroup>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
        <form onSubmit={handleSubmitForm}>
          {title && (
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
          )}
          <div className="grid gap-4 py-4">
            {single ? renderSingle() : renderMultiple()}
            {canAdd && (
              <div className="flex items-center gap-x-2">
                <Input
                  onChange={(e) => setNewOption(e.target.value)}
                  value={newOption}
                  placeholder={t('Добавить новый')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAdd();
                    }
                  }}
                />
                <Button onClick={handleAdd} variant="outline" type="button">
                  {t('Добавить')}
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              {t('Отмена')}
            </Button>
            <Button type="submit">{t('Применить')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
