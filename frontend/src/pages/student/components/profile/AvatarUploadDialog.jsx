import { Avatar, Button, Dialog, Flex } from "@radix-ui/themes"
import { useQueryClient } from "@tanstack/react-query"
import { Camera, Upload } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useUploadAvatar } from "../../../../api/user/user.mutations"
import ErrorCallout from "../../../../components/ErrorCallout"
import { useAuth } from "../../../../Context/AuthContext"

// Avatar Upload Dialog
function AvatarUploadDialog({ isOpen, setIsOpen, children }) {
  const fileInputRef = useRef(null)
  const queryClient = useQueryClient()
  const uploadAvatarMutation = useUploadAvatar()
  const { user, setUser } = useAuth()
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Clean up old preview if exists
    if (preview && typeof preview === "string") {
      URL.revokeObjectURL(preview)
    }

    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  // Clean up when component unmounts or when preview changes
  useEffect(() => {
    return () => {
      if (preview && typeof preview === "string") {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const res = await uploadAvatarMutation.mutateAsync(selectedFile)
      console.log(res)
      const avatar = res.data?.avatar
      if (avatar) {
        setUser({ ...user, avatar })
      }
      toast.success('Avatar updated successfully')
      queryClient.invalidateQueries(['users', 'profile'])
      handleClose()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to upload avatar')
    }
  }

  // Clean up preview and close dialog
  function handleClose() {
    setTimeout(() => {
      if (preview && typeof preview === "string") {
        URL.revokeObjectURL(preview)
        setPreview(null)
      }
      setSelectedFile(null)
    }, 0)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => {
      setIsOpen(o);
      handleClose();
    }}>
      {children && (
        <Dialog.Trigger>
          {children}
        </Dialog.Trigger>
      )}
      <Dialog.Content maxWidth="400px">
        <Dialog.Title>Upload Avatar</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Choose a new profile picture. Supported formats: JPG, PNG, GIF (max 5MB)
        </Dialog.Description>

        <Flex direction={'column'} gap={'4'}>
          {/* Error Callout */}
          {uploadAvatarMutation.isError && (
            <ErrorCallout
              errorMessage={uploadAvatarMutation.error?.response?.data?.message || 'Failed to upload avatar'}
            />
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Preview */}
          {preview && (
            <Flex justify="center">
              <Avatar
                size="9"
                src={preview}
                radius="full"
                fallback={user?.firstName?.[0] || 'S'}
                my={'4'}
              />
            </Flex>
          )}

          <Flex direction="column" gap="3">
            {/* Select Image Button */}
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatarMutation.isPending}
              size="3"
            >
              <Camera size={20} />
              Select Image
            </Button>

            {/* Upload Button */}
            {preview && (
              <Button
                variant='surface'
                size={'3'}
                onClick={handleUpload}
                disabled={uploadAvatarMutation.isPending}
              >
                <Upload size={20} />
                {uploadAvatarMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
            )}

            <Flex gap="3" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">Cancel</Button>
              </Dialog.Close>
            </Flex>
          </Flex>
        </Flex>

      </Dialog.Content>
    </Dialog.Root>
  )
}

export default AvatarUploadDialog