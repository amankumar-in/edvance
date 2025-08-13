import { Button, Callout, Flex, IconButton, Text } from "@radix-ui/themes";
import { Upload, X, FileText, Info } from 'lucide-react';
import { useState } from "react";
import { toast } from "sonner";

const FileUpload = ({
  onFilesChange,
  maxFiles = 5,
  maxSizePerFile = 10, // MB
  acceptedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'video/mp4', 'video/quicktime', 'video/x-msvideo'
  ],
  acceptString = ".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.mp4,.mov,.avi",
  existingAttachments = [], // New prop for existing attachments
  showDetailedHelp = true // New prop to control helper text verbosity
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState(existingAttachments);

  // Helper function to determine file type
  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'text/plain' || mimeType.includes('application/')) return 'document';
    return 'document';
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Validate files
    const validFiles = files.filter(file => {
      // Check file size
      if (file.size > maxSizePerFile * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is ${maxSizePerFile}MB`);
        return false;
      }

      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not a supported type`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      const newFiles = [...selectedFiles, ...validFiles];
      const totalFiles = newFiles.length + existingFiles.length;
      if (totalFiles > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed (including existing files)`);
        return;
      }

      setSelectedFiles(newFiles);

      // Create attachment objects for form
      const newAttachments = validFiles.map(file => ({
        type: getFileType(file.type),
        name: file.name,
        contentType: file.type,
        file: file // Store the actual file for upload
      }));

      // Call parent callback with all files
      const allAttachments = [
        ...selectedFiles.map(file => ({
          type: getFileType(file.type),
          name: file.name,
          contentType: file.type,
          file: file
        })),
        ...newAttachments
      ];

      onFilesChange(allAttachments, existingFiles);
    }
  };

  // Remove new file
  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);

    const newAttachments = newFiles.map(file => ({
      type: getFileType(file.type),
      name: file.name,
      contentType: file.type,
      file: file
    }));

    onFilesChange(newAttachments, existingFiles);
  };

  // Remove existing file
  const removeExistingFile = (index) => {
    const newExistingFiles = existingFiles.filter((_, i) => i !== index);
    setExistingFiles(newExistingFiles);

    const newAttachments = selectedFiles.map(file => ({
      type: getFileType(file.type),
      name: file.name,
      contentType: file.type,
      file: file
    }));

    onFilesChange(newAttachments, newExistingFiles);
  };

  return (
    <div className="space-y-3">
      {/* File Upload Button */}
      <Button
        type="button"
        variant="outline"
        asChild
        className="cursor-pointer"
      >
        <label>
          <Upload size={16} />
          Select Files
          <input
            type="file"
            multiple
            accept={acceptString}
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      </Button>

      {/* Existing Files List */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <Text as="div" size="2" weight="medium">
            Existing Attachments ({existingFiles.length})
          </Text>
          {existingFiles.map((file, index) => (
            <Flex gap="2" key={`existing-${index}`} align="center" justify="between" className="p-2 bg-[--accent-a2] rounded">
              <Flex align="start" gap="2">
                <FileText size={16}/>
                <div className="flex-1 space-y-1">
                  <Text as="p" size="2" className="leading-none">
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="line-clamp-1">
                      {file.name}
                    </a>
                  </Text>
                  <Text as="p" size="1" color="gray">
                    ({file.type})
                  </Text>
                </div>
              </Flex>
              <IconButton
                type="button"
                variant="ghost"
                size="1"
                onClick={() => removeExistingFile(index)}
                color="gray"
              >
                <X size={14} />
              </IconButton>
            </Flex>
          ))}
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <Text as="div" size="2" weight="medium">
            New Files ({selectedFiles.length}/{maxFiles - existingFiles.length})
          </Text>
          {selectedFiles.map((file, index) => (
            <Flex gap="2" key={`new-${index}`} align="center" justify="between" className="p-2 bg-[--gray-a2] rounded">
              <Flex align="start" gap="2">
                <FileText size={16} />
                <div className="flex-1 space-y-1">
                  <Text as="p" size="2" className="leading-none">
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="line-clamp-1">
                      {file.name}
                    </a>
                  </Text>
                  <Text size="1" color="gray">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </Text>
                </div>
              </Flex>
              <IconButton
                type="button"
                variant="ghost"
                size="1"
                onClick={() => removeFile(index)}
                color="gray"
              >
                <X size={14} />
              </IconButton>
            </Flex>
          ))}
        </div>
      )}

      {/* File Type Info */}
      {showDetailedHelp ? (
        <Callout.Root color="blue" variant="surface">
          <Callout.Icon>
            <Info size={16} />
          </Callout.Icon>
          <Callout.Text>
            Supported file types: Images (JPG, PNG, GIF), Documents (PDF, DOC, DOCX, TXT), Videos (MP4, MOV, AVI) <br />
            Maximum file size: {maxSizePerFile}MB per file, Maximum {maxFiles} files
          </Callout.Text>
        </Callout.Root>
      ) : (
        <Text as="p" size="1" color="gray">
          Max {maxFiles} files, {maxSizePerFile}MB each
        </Text>
      )}
    </div>
  );
};

export default FileUpload; 