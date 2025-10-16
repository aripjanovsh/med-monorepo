import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, $getNodeByKey, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { CustomElementNode, CustomElementData } from './base/CustomElementNode';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReactNode, useState } from 'react';
import { LexicalEditor, EditorConfig, NodeKey } from 'lexical';
import { generateElementId } from './utils/generateId';
import { ElementEditDialog } from './components/ElementEditDialog';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export class TextInputNode extends CustomElementNode {
  static getType(): string {
    return 'text-input';
  }

  constructor(data: CustomElementData = {
    type: 'text',
    id: generateElementId('text'),
    label: '',
    placeholder: '',
    required: false,
    displayMode: 'inline',
    width: '150px'
  }, key?: NodeKey) {
    super(data, key);
  }

  static clone(node: TextInputNode): TextInputNode {
    return new TextInputNode(node.__data, node.__key);
  }

  static importJSON(serializedNode: any): TextInputNode {
    const { data } = serializedNode;
    return new TextInputNode(data);
  }

  exportJSON(): any {
    return {
      data: this.__data,
      type: 'text-input',
      version: 1,
    };
  }

  decorate(editor: LexicalEditor, config: EditorConfig): ReactNode {
    return <TextInputComponent data={this.__data} nodeKey={this.__key} editor={editor} />;
  }
}

interface TextInputComponentProps {
  data: CustomElementData;
  nodeKey: NodeKey;
  editor: LexicalEditor;
}

function TextInputComponent({ data, nodeKey, editor }: TextInputComponentProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (newData: CustomElementData) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as TextInputNode;
      if (node) {
        node.setData(newData);
      }
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const elementContent = (
    <>
      <span
        className={`${data.displayMode === 'block' ? 'flex' : 'inline-flex'} items-center gap-1 ${data.displayMode === 'block' ? 'my-2' : 'mx-1'} group relative`}
        contentEditable={false}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        {data.label && (
          <span className="text-sm font-medium">{data.label}:</span>
        )}
        <Input
          type="text"
          placeholder={data.placeholder || '___'}
          disabled
          className="inline-flex h-7 px-2 text-sm border-b border-t-0 border-x-0 rounded-none bg-transparent hover:bg-muted/50"
          style={{ width: data.width || '150px' }}
        />
        {data.required && <span className="text-red-500 text-xs">*</span>}
        <Button
          size="icon"
          variant="ghost"
          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity absolute -right-6"
          onClick={handleClick}
        >
          <Settings2 className="h-3 w-3" />
        </Button>
      </span>
      <ElementEditDialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        data={data}
        onSave={handleSave}
      />
    </>
  );

  return elementContent;
}

export const INSERT_TEXT_INPUT_COMMAND = createCommand<CustomElementData>('INSERT_TEXT_INPUT_COMMAND');

export default function TextInputPlugin(): null {
  const [editor] = useLexicalComposerContext();

  if (!editor.hasNodes([TextInputNode])) {
    throw new Error('TextInputPlugin: TextInputNode not registered on editor');
  }

  editor.registerCommand(
    INSERT_TEXT_INPUT_COMMAND,
    (data: CustomElementData) => {
      const node = new TextInputNode({
        displayMode: 'inline',
        width: '150px',
        ...data,
        type: 'text',
      });
      $insertNodes([node]);
      return true;
    },
    COMMAND_PRIORITY_EDITOR
  );

  return null;
}