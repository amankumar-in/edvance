import { Box, Button, Callout, Flex, IconButton, Text, Tooltip } from "@radix-ui/themes";
import { HelpCircle, Info, Upload, X } from 'lucide-react';
import { useState } from "react";
import { toast } from "sonner";
import { useUploadAvatar } from "../api/user/user.mutations";


export default function ProfilePictureUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const {
    mutateAsync: uploadAvatar,
    isPending: isUploading,
    isError: isErrorUploading,
    error: uploadError,
    reset: resetUploadStatus
  } = useUploadAvatar();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPG, JPEG, PNG, or GIF files are allowed');
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      // Reset status when new file is selected
      setUploadSuccess(false);
      resetUploadStatus();

      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadAvatar(selectedFile);
      setUploadSuccess(true);
      toast.success('Profile picture uploaded successfully');
    } catch (error) {
      console.error('Failed to upload profile picture', error);
      toast.error(error?.response?.data?.message || 'Failed to upload profile picture');
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <Flex direction="column">
        <Flex align="center" gap="2">
          <Text as="div" size="2" weight="medium">
            Profile Picture
          </Text>
          <Tooltip content="Upload a clear photo of yourself. Square images work best.">
            <HelpCircle size={14} />
          </Tooltip>
        </Flex>

        <Text as="p" size="1" color="gray" className="mb-2">
          {uploadSuccess
            ? "Your profile picture has been successfully uploaded!"
            : "Select a photo, then click 'Upload' to save your profile picture."}
        </Text>
      </Flex>

      <div className="flex relative flex-col w-full">
        <div className="w-24 h-24 mb-2 overflow-hidden border-2 border-[--gray-a6] rounded-full mx-auto">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile Preview"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-[--gray-a3]">
              <Text as="p" size="2" color="gray">
                No Image
              </Text>
            </div>
          )}
        </div>

        <div className="flex gap-2 w-full">
          <Button
            asChild
            size="3"
            className="flex-1 w-full cursor-pointer"
            variant="surface"
          >
            <label>
              <Upload size={18} />
              {previewUrl ? 'Change' : 'Select'}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </Button>
          {selectedFile && !uploadSuccess && (
            <Button
              type="button"
              variant="outline"
              size="3"
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 max-w-xs"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          )}
          {previewUrl && !isUploading && !uploadSuccess && (
            <IconButton
              type="button"
              color="gray"
              variant="soft"
              size="3"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                setUploadSuccess(false);
                resetUploadStatus();
              }}
            >
              <X size={16} />
            </IconButton>
          )}
        </div>
      </div>

      {isErrorUploading && (
        <Text
          as="p"
          size={"2"}
          color='red'
          className="flex gap-1 items-center mt-1"
        >
          <Info size={14} /> {uploadError?.response?.data?.message || 'Upload failed'}
        </Text>
      )}

      {/* Helper text section */}
      <Box className="mt-1">
        <Callout.Root color="blue" variant="surface">
          <Callout.Icon>
            <Info size={14} />
          </Callout.Icon>
          <Callout.Text>
            Accepted file types: JPG, JPEG, PNG, GIF <br />
            Maximum file size: 5MB
          </Callout.Text>
        </Callout.Root>
      </Box>
    </div>
  );
}
