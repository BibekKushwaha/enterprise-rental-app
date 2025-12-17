import React from "react";
import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
  useFieldArray,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, X, Plus } from "lucide-react";
import { registerPlugin } from "filepond";
import { FilePond } from "react-filepond";

import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

interface FormFieldProps {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "textarea"
    | "number"
    | "select"
    | "switch"
    | "password"
    | "file"
    | "multi-input";
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
  multiple?: boolean;
  isIcon?: boolean;
}

export const CustomFormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  options,
  accept,
  className,
  inputClassName,
  labelClassName,
  disabled = false,
  multiple = false,
  isIcon = false,
}) => {
  const { control } = useFormContext();

  const renderFormControl = (
    field: ControllerRenderProps<FieldValues, string>
  ) => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            placeholder={placeholder}
            value={field.value ?? ""}
            onChange={field.onChange}
            rows={3}
            className={`border-gray-200 p-4 ${inputClassName}`}
          />
        );

      case "select":
        return (
          <Select value={field.value ?? ""} onValueChange={field.onChange}>
            <SelectTrigger className={`w-full border-gray-200 p-4 ${inputClassName}`}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="w-full border-gray-200 shadow">
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={!!field.value}
              onCheckedChange={field.onChange}
              id={name}
            />
            <FormLabel htmlFor={name} className={labelClassName}>
              {label}
            </FormLabel>
          </div>
        );

      case "file":
        return (
          <FilePond
            className={`${inputClassName}`}
            onupdatefiles={(fileItems) => {
              const files = fileItems
                .map((item) => item.file)
                .filter((f) => f instanceof File);
              field.onChange(files);
            }}
            allowMultiple={true}
            labelIdle={`Drag & Drop or Browse`}
            credits={false}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={field.value ?? ""}
            onChange={(e) => field.onChange(Number(e.target.value))}
            placeholder={placeholder}
            className={`border-gray-200 p-4 ${inputClassName}`}
            disabled={disabled}
          />
        );

      default:
        return (
          <Input
            type={type}
            placeholder={placeholder}
            value={field.value ?? ""}
            onChange={field.onChange}
            className={`border-gray-200 p-4 ${inputClassName}`}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <FormField
      control={control}
      name={name}  // 🔥 FIX: removed defaultValue
      render={({ field }) => (
        <FormItem className={`${type !== "switch" ? "rounded-md" : ""} ${className}`}>
          {type !== "switch" && (
            <div className="flex justify-between items-center">
              <FormLabel className={`text-sm ${labelClassName}`}>{label}</FormLabel>

              {!disabled && isIcon && type !== "file" && type !== "multi-input" && (
                <Edit className="size-4 text-customgreys-dirtyGrey" />
              )}
            </div>
          )}

          <FormControl>
            {renderFormControl({
              ...field,
              value: field.value, // 🔥 FIX: Removed initialValue merging
            })}
          </FormControl>

          <FormMessage className="text-red-400" />
        </FormItem>
      )}
    />
  );
};

// ------- MULTI INPUT FIELD -------

interface MultiInputFieldProps {
  name: string;
  control: any;
  placeholder?: string;
  inputClassName?: string;
}

const MultiInputField: React.FC<MultiInputFieldProps> = ({
  name,
  control,
  placeholder,
  inputClassName,
}) => {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-2">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-center space-x-2">
          <FormField
            control={control}
            name={`${name}.${index}`}
            render={({ field }) => (
              <FormControl>
                <Input
                  {...field}
                  placeholder={placeholder}
                  className={`flex-1 border-none bg-customgreys-darkGrey p-4 ${inputClassName}`}
                />
              </FormControl>
            )}
          />

          <Button
            type="button"
            onClick={() => remove(index)}
            variant="ghost"
            size="icon"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        onClick={() => append("")}
        variant="outline"
        size="sm"
        className="mt-2"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
};
