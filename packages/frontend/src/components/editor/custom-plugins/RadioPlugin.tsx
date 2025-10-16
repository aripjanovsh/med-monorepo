import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, $getNodeByKey, COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { CustomElementNode, CustomElementData } from './base/CustomElementNode';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ReactNode, useState } from 'react';
import { LexicalEditor, EditorConfig, NodeKey } from 'lexical';
import { generateElementId } from './utils/generateId';
import { ElementEditDialog } from './components/ElementEditDialog';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export class RadioNode extends CustomElementNode {
  static getType(): string {
    return 'radio-input';
  }

  constructor(data: CustomElementData = {
    type: 'radio',
    id: generateElementId('radio'),
    label: '',
    placeholder: '',
    required: false,
    displayMode: 'block',
    options: []
  }, key?: NodeKey) {
    super(data, key);
  }

  static clone(node: RadioNode): RadioNode {
    return new RadioNode(node.__data, node.__key);
  }

  static importJSON(serializedNode: any): RadioNode {
    const { data } = serializedNode;
    return new RadioNode(data);
  }

  exportJSON(): any {
    return {
      data: this.__data,
      type: 'radio-input',
      version: 1,
    };
  }

  decorate(editor: LexicalEditor, config: EditorConfig): ReactNode {
    return <RadioComponent data={this.__data} nodeKey={this.__key} editor={editor} />;
  }
}

interface RadioComponentProps {
  data: CustomElementData;
  nodeKey: NodeKey;
  editor: LexicalEditor;
}

function RadioComponent({ data, nodeKey, editor }: RadioComponentProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (newData: CustomElementData) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey) as RadioNode;
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

  return (
    <>
      <div
        className={`${data.displayMode === 'block' ? 'my-2' : 'inline-block mx-1'} group relative p-2 rounded hover:bg-muted/50 cursor-pointer`}
        contentEditable={false}
        onClick={handleClick}
      >
        {data.label && (
          <Label className="mb-2 block text-sm font-medium">
            {data.label}
            {data.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <RadioGroup disabled defaultValue={data.defaultValue as string}>
          {data.options?.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 mb-1">
              <RadioGroupItem 
                value={option.value} 
                id={`${data.id}-${option.value}`}
                className="cursor-not-allowed h-3 w-3"
              />
              <Label 
                htmlFor={`${data.id}-${option.value}`}
                className="cursor-not-allowed text-sm"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <Button
          size="icon"
          variant="ghost"
          className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 right-0"
          onClick={handleClick}
        >
          <Settings2 className="h-3 w-3" />
        </Button>
      </div>
      <ElementEditDialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        data={data}
        onSave={handleSave}
      />
    </>
  );
}

export const INSERT_RADIO_COMMAND = createCommand<CustomElementData>('INSERT_RADIO_COMMAND');

export default function RadioPlugin(): null {
  const [editor] = useLexicalComposerContext();

  if (!editor.hasNodes([RadioNode])) {
    throw new Error('RadioPlugin: RadioNode not registered on editor');
  }

  editor.registerCommand(
    INSERT_RADIO_COMMAND,
    (data: CustomElementData) => {
      const node = new RadioNode({
        displayMode: 'block',
        ...data,
        type: 'radio',
      });
      $insertNodes([node]);
      return true;
    },
    COMMAND_PRIORITY_EDITOR
  );

  return null;
}