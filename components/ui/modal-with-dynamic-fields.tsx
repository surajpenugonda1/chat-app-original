import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface KeyValue {
  key: string;
  value: string;
}

interface ModalWithDynamicFieldsProps {
  open: boolean;
  onSave: (title: string, fields: KeyValue[]) => void;
  onCancel: () => void;
  initialTitle?: string;
  initialFields?: KeyValue[];
}

export const ModalWithDynamicFields: React.FC<ModalWithDynamicFieldsProps> = ({
  open,
  onSave,
  onCancel,
  initialTitle = "",
  initialFields = [],
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [fields, setFields] = useState<KeyValue[]>(initialFields.length > 0 ? initialFields : [{ key: "", value: "" }]);

  const handleFieldChange = (index: number, field: keyof KeyValue, value: string) => {
    setFields((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddField = () => {
    setFields((prev) => [...prev, { key: "", value: "" }]);
  };

  const handleRemoveField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(title, fields.filter(f => f.key.trim() !== ""));
  };

  const handleCancel = () => {
    setTitle(initialTitle);
    setFields(initialFields.length > 0 ? initialFields : [{ key: "", value: "" }]);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>Add Details</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter title"
            className="mb-2"
          />
        </div>
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={field.key}
                onChange={e => handleFieldChange(idx, "key", e.target.value)}
                placeholder="Key name"
                className="flex-1"
              />
              <Input
                value={field.value}
                onChange={e => handleFieldChange(idx, "value", e.target.value)}
                placeholder="Key value"
                className="flex-1"
              />
              {fields.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => handleRemoveField(idx)} type="button">
                  ×
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" className="mt-2 w-full" onClick={handleAddField} type="button">
            + Add Field
          </Button>
        </div>
        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <Button variant="secondary" onClick={handleCancel} type="button">Cancel</Button>
          <Button onClick={handleSave} type="button">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 