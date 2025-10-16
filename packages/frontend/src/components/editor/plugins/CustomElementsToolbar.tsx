'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, Type, List, CheckSquare, Circle, AlignLeft } from 'lucide-react';
import {
  INSERT_TEXT_INPUT_COMMAND,
  INSERT_SELECT_COMMAND,
  INSERT_RADIO_COMMAND,
  INSERT_CHECKBOX_COMMAND,
  INSERT_TEXTAREA_COMMAND,
  CustomElementData,
} from '../custom-plugins';
import { generateElementId } from '../custom-plugins/utils/generateId';

type ElementType = 'text' | 'select' | 'radio' | 'checkbox' | 'textarea';

interface Option {
  value: string;
  label: string;
}

export default function CustomElementsToolbar() {
  const [editor] = useLexicalComposerContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [elementType, setElementType] = useState<ElementType>('text');
  const [elementData, setElementData] = useState<Partial<CustomElementData>>({
    id: '',
    label: '',
    placeholder: '',
    required: false,
    options: [],
    rows: 4,
  });
  const [newOption, setNewOption] = useState({ value: '', label: '' });

  const resetForm = () => {
    setElementData({
      id: '',
      label: '',
      placeholder: '',
      required: false,
      displayMode: 'inline',
      width: '150px',
      options: [],
      rows: 4,
    });
    setNewOption({ value: '', label: '' });
  };

  const handleInsert = () => {
    const data: CustomElementData = {
      type: elementType,
      id: generateElementId(elementType),
      label: elementData.label,
      placeholder: elementData.placeholder,
      required: elementData.required,
      displayMode: elementData.displayMode || 'inline',
      width: elementData.width || '150px',
      options: elementData.options,
      rows: elementData.rows,
    };

    // Dispatch appropriate command based on element type
    switch (elementType) {
      case 'text':
        editor.dispatchCommand(INSERT_TEXT_INPUT_COMMAND, data);
        break;
      case 'select':
        editor.dispatchCommand(INSERT_SELECT_COMMAND, data);
        break;
      case 'radio':
        editor.dispatchCommand(INSERT_RADIO_COMMAND, data);
        break;
      case 'checkbox':
        editor.dispatchCommand(INSERT_CHECKBOX_COMMAND, data);
        break;
      case 'textarea':
        editor.dispatchCommand(INSERT_TEXTAREA_COMMAND, data);
        break;
    }

    setDialogOpen(false);
    resetForm();
  };

  const addOption = () => {
    if (newOption.value && newOption.label) {
      setElementData({
        ...elementData,
        options: [...(elementData.options || []), newOption],
      });
      setNewOption({ value: '', label: '' });
    }
  };

  const removeOption = (index: number) => {
    setElementData({
      ...elementData,
      options: elementData.options?.filter((_, i) => i !== index),
    });
  };

  const needsOptions = ['select', 'radio', 'checkbox'].includes(elementType);

  return (
    <>
      <div className="flex items-center gap-2 border-b p-2 bg-muted/30">
        <span className="text-sm font-medium text-muted-foreground">
          Вставить элемент формы:
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setElementType('text');
            setDialogOpen(true);
          }}
        >
          <Type className="h-4 w-4 mr-1" />
          Текст
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setElementType('select');
            setDialogOpen(true);
          }}
        >
          <List className="h-4 w-4 mr-1" />
          Список
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setElementType('radio');
            setDialogOpen(true);
          }}
        >
          <Circle className="h-4 w-4 mr-1" />
          Радио
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setElementType('checkbox');
            setDialogOpen(true);
          }}
        >
          <CheckSquare className="h-4 w-4 mr-1" />
          Чекбокс
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setElementType('textarea');
            setDialogOpen(true);
          }}
        >
          <AlignLeft className="h-4 w-4 mr-1" />
          Текстовая область
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Добавить {elementType === 'text' && 'текстовое поле'}
              {elementType === 'select' && 'выпадающий список'}
              {elementType === 'radio' && 'радио-кнопки'}
              {elementType === 'checkbox' && 'чекбокс'}
              {elementType === 'textarea' && 'текстовую область'}
            </DialogTitle>
            <DialogDescription>
              Настройте параметры элемента формы
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="element-label">Метка</Label>
              <Input
                id="element-label"
                value={elementData.label}
                onChange={(e) => setElementData({ ...elementData, label: e.target.value })}
                placeholder="Отображаемая метка"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-mode">Режим отображения</Label>
              <Select
                value={elementData.displayMode || 'inline'}
                onValueChange={(value: 'inline' | 'block') => 
                  setElementData({ ...elementData, displayMode: value })
                }
              >
                <SelectTrigger id="display-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inline">Inline (в строке с текстом)</SelectItem>
                  <SelectItem value="block">Block (отдельный блок)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {elementData.displayMode === 'inline' && elementType !== 'textarea' && (
              <div className="space-y-2">
                <Label htmlFor="element-width">Ширина (для inline режима)</Label>
                <Input
                  id="element-width"
                  value={elementData.width || '150px'}
                  onChange={(e) => setElementData({ ...elementData, width: e.target.value })}
                  placeholder="например: 150px, 50%, 10rem"
                />
              </div>
            )}

            {elementType !== 'checkbox' && elementType !== 'radio' && (
              <div className="space-y-2">
                <Label htmlFor="element-placeholder">Placeholder</Label>
                <Input
                  id="element-placeholder"
                  value={elementData.placeholder}
                  onChange={(e) => setElementData({ ...elementData, placeholder: e.target.value })}
                  placeholder="Подсказка"
                />
              </div>
            )}

            {elementType === 'textarea' && (
              <div className="space-y-2">
                <Label htmlFor="element-rows">Количество строк</Label>
                <Input
                  id="element-rows"
                  type="number"
                  min="1"
                  max="20"
                  value={elementData.rows}
                  onChange={(e) => setElementData({ ...elementData, rows: parseInt(e.target.value) || 4 })}
                />
              </div>
            )}

            {needsOptions && (
              <div className="space-y-2">
                <Label>Опции</Label>
                <div className="space-y-2">
                  {elementData.options?.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={option.value} disabled />
                      <Input value={option.label} disabled />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Значение"
                      value={newOption.value}
                      onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                    />
                    <Input
                      placeholder="Текст"
                      value={newOption.label}
                      onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="element-required"
                checked={elementData.required}
                onCheckedChange={(checked) => setElementData({ ...elementData, required: checked })}
              />
              <Label htmlFor="element-required">Обязательное поле</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleInsert}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}