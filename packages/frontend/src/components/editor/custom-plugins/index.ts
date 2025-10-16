// Экспорт типов (без экспорта самого класса)
export type { CustomElementData, SerializedCustomElementNode } from './base/CustomElementNode';
// Экспорт утилит
export { generateElementId } from './utils/generateId';

// Экспорт плагинов
export { default as TextInputPlugin, TextInputNode, INSERT_TEXT_INPUT_COMMAND } from './TextInputPlugin';
export { default as SelectPlugin, SelectNode, INSERT_SELECT_COMMAND } from './SelectPlugin';
export { default as RadioPlugin, RadioNode, INSERT_RADIO_COMMAND } from './RadioPlugin';
export { default as CheckboxPlugin, CheckboxNode, INSERT_CHECKBOX_COMMAND } from './CheckboxPlugin';
export { default as TextareaPlugin, TextareaNode, INSERT_TEXTAREA_COMMAND } from './TextareaPlugin';

// Массив всех нод для регистрации
import { TextInputNode } from './TextInputPlugin';
import { SelectNode } from './SelectPlugin';
import { RadioNode } from './RadioPlugin';
import { CheckboxNode } from './CheckboxPlugin';
import { TextareaNode } from './TextareaPlugin';

export const CUSTOM_ELEMENT_NODES = [
  TextInputNode,
  SelectNode,
  RadioNode,
  CheckboxNode,
  TextareaNode,
];