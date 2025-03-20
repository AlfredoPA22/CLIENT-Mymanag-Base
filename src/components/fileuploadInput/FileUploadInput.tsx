import { useRef, type FC } from "react";

import { Button } from "primereact/button";
import { FileUpload, FileUploadProps } from "primereact/fileupload";
import LabelInput from "../labelInput/LabelInput";

interface FieldSimpleFileUploadProps extends FileUploadProps {
  className?: string;
  error?: string;
  label: string;
  mandatory?: boolean;
  file?: File | null;
  onFileClear: () => void;
}

const FieldSimpleFileUpload: FC<FieldSimpleFileUploadProps> = ({
  className,
  error,
  label,
  mandatory = false,
  file,
  onSelect,
  onFileClear,
  ...props
}) => {
  const fileUploadRef = useRef<FileUpload>(null);

  const onLocalFileClear = () => {
    if (fileUploadRef && fileUploadRef.current) {
      fileUploadRef.current.clear();
      onFileClear();
    }
  };

  return (
    <section className={`flex flex-col gap-2 ${className}`}>
      <LabelInput name={props.name} label={label} mandatory={mandatory} />

      <FileUpload ref={fileUploadRef} onSelect={onSelect} {...props} />
      <small className="p-error">{error}</small>

      {file && (
        <section className="flex h-10 items-center rounded-lg bg-secondary px-2">
          <span>{file.name ? file.name : ""}</span>
          <Button
            onClick={onLocalFileClear}
            type="button"
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            aria-label="Cancel"
          />
        </section>
      )}
    </section>
  );
};

export default FieldSimpleFileUpload;
