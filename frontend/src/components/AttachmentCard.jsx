import { Card, Flex, IconButton, Text, Tooltip } from '@radix-ui/themes';
import {
  Download,
  FileText
} from 'lucide-react';
import React from 'react';

const AttachmentCard = ({ attachment }) => {
  const { contentType, name, url, type } = attachment;

  const isImage = contentType?.startsWith("image/");
  const isPDF = contentType === "application/pdf";
  const isVideo = contentType?.startsWith("video/");
  const isTextOrDoc =
    contentType?.includes("msword") ||
    contentType?.includes("officedocument") ||
    contentType === "text/plain";

  // Function to force download
  const downloadFile = async (fileUrl, fileName) => {
    try {
      // Extract filename from URL and use download endpoint
      const urlParts = fileUrl.split('/');
      const actualFileName = urlParts[urlParts.length - 1];
      const baseUrl = fileUrl.substring(0, fileUrl.lastIndexOf('/'));
      const downloadUrl = `${baseUrl}/download/${actualFileName}`;

      // Create a temporary link and click it
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to fetch method
      try {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } catch (fallbackError) {
        console.error('Fallback download failed:', fallbackError);
        // Final fallback to opening in new tab
        window.open(fileUrl, '_blank');
      }
    }
  };

  return (
    <Card asChild>
      <a href={url} target='_blank' rel='noopener noreferrer'>
        <Flex gap="2" className='' justify='between' align='center'>
          <div className='flex gap-2'>
            {/* === Preview Section === */}
            {isImage && (
              <div className="relative  rounded-md group border-[--gray-a6] shadow-md bg-[--accent-a3]">
                <img
                  src={url}
                  alt={name}
                  className="object-contain object-center w-12 rounded-md aspect-square"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.warn('Image failed to load due to CORS:', url);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              </div>
            )}

            {(isPDF || isTextOrDoc) && (
              <div className=' border-[--gray-a6] size-12 rounded-md bg-[--red-a3] flex items-center justify-center shadow-md'>
                <FileText size={20} className="text-[--red-11]" />
              </div>
            )}

            {isVideo && (
              <video controls className="w-full max-w-md rounded-md border">
                <source src={url} type={contentType} />
                Your browser does not support the video tag.
              </video>
            )}

            {/* === Name and Type === */}
            <div className='flex-1'>
              <Text as='p' size="2" weight="medium" className='break-all line-clamp-1'>{name}</Text>
              <Text as='p' size="1" color='gray' className='capitalize'>{type}</Text>
            </div>
          </div>

          {/* === Download === */}
          <Flex gap='2' align='center'>
            <Tooltip content='Download'>
              <IconButton
                variant='soft'
                className="self-start"
                highContrast
                onClick={() => downloadFile(url, name)}
              >
                <Download size={14} />
              </IconButton>
            </Tooltip>
          </Flex>
        </Flex>
      </a>
    </Card>
  );
};

export default AttachmentCard;
