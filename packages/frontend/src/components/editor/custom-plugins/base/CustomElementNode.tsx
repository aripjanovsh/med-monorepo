import {
  DecoratorNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
  LexicalNode,
  EditorConfig,
  LexicalEditor,
} from 'lexical';
import { ReactNode } from 'react';
import { generateElementId } from '../utils/generateId';

export interface CustomElementData {
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'textarea';
  id: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  displayMode?: 'inline' | 'block'; // новое поле для режима отображения
  options?: Array<{
    value: string;
    label: string;
  }>;
  defaultValue?: string | boolean | string[];
  rows?: number; // для textarea
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  width?: string; // ширина для inline элементов
}

export type SerializedCustomElementNode = Spread<
  {
    data: CustomElementData;
    type: 'custom-element';
    version: 1;
  },
  SerializedLexicalNode
>;

export abstract class CustomElementNode extends DecoratorNode<ReactNode> {
  __data: CustomElementData;

  constructor(data: CustomElementData = {
    type: 'text',
    id: generateElementId('element'),
    label: '',
    placeholder: '',
    required: false,
    displayMode: 'inline',
    width: '150px'
  }, key?: NodeKey) {
    super(key);
    this.__data = data;
  }

  static getType(): string {
    // Возвращаем базовый тип, но этот класс не должен регистрироваться
    // Каждый наследник должен переопределить этот метод
    return 'custom-element-base';
  }

  static clone(node: CustomElementNode): CustomElementNode {
    return new (this as any)(node.__data, node.__key);
  }

  getData(): CustomElementData {
    return this.__data;
  }

  setData(data: CustomElementData): void {
    const writable = this.getWritable();
    writable.__data = data;
  }

  exportJSON(): SerializedCustomElementNode {
    return {
      data: this.__data,
      type: 'custom-element',
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedCustomElementNode): CustomElementNode {
    const { data } = serializedNode;
    return new (this as any)(data);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement(this.__data.displayMode === 'block' ? 'div' : 'span');
    span.setAttribute('data-element-type', this.__data.type);
    span.setAttribute('data-element-id', this.__data.id);
    span.style.display = this.__data.displayMode === 'block' ? 'block' : 'inline-block';
    return span;
  }

  updateDOM(prevNode: CustomElementNode): boolean {
    return prevNode.__data.displayMode !== this.__data.displayMode;
  }

  isInline(): boolean {
    return this.__data.displayMode === 'inline';
  }

  isKeyboardSelectable(): boolean {
    return true;
  }

  // Абстрактный метод, который должен быть реализован в наследниках
  abstract decorate(editor: LexicalEditor, config: EditorConfig): ReactNode;
}