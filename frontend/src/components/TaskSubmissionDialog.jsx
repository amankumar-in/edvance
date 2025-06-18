import {
  Button,
  Card,
  Dialog,
  Flex,
  IconButton,
  Select,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import {
  FileImage,
  FileText,
  Link as LinkIcon,
  MessageSquare,
  Plus,
  Upload,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

function TaskSubmissionDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  task,
  submitButtonText = "Submit Task",
  isSubmitting = false,
  isSubmissionError = false,
  submissionError = null
}) {
  const [submissionNote, setSubmissionNote] = useState('');
  const [evidenceList, setEvidenceList] = useState([]);
  const [newEvidence, setNewEvidence] = useState({ type: 'text', content: '', url: '', file: null });

  // Handle file selection for evidence
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Unsupported file type. Please use images, PDFs, documents, or text files.');
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Determine evidence type based on file type
      let evidenceType = 'document';
      if (file.type.startsWith('image/')) {
        evidenceType = 'image';
      } else if (file.type.startsWith('video/')) {
        evidenceType = 'document';
      }

      setNewEvidence({ 
        ...newEvidence, 
        type: evidenceType,
        file: file,
        url: file.name, // Use filename as display text
        content: ''
      });
    }
  };

  // Handle adding evidence
  const addEvidence = () => {
    if (newEvidence.type === 'text' && newEvidence.content.trim()) {
      setEvidenceList([...evidenceList, { 
        ...newEvidence, 
        id: Date.now(),
        file: null // Text evidence doesn't have files
      }]);
      setNewEvidence({ type: 'text', content: '', url: '', file: null });
    } else if (newEvidence.type === 'link' && newEvidence.url.trim()) {
      setEvidenceList([...evidenceList, { 
        ...newEvidence, 
        id: Date.now(),
        file: null // Link evidence doesn't have files
      }]);
      setNewEvidence({ type: 'text', content: '', url: '', file: null });
    } else if (['image', 'document'].includes(newEvidence.type) && (newEvidence.file || newEvidence.url.trim())) {
      setEvidenceList([...evidenceList, { ...newEvidence, id: Date.now() }]);
      setNewEvidence({ type: 'text', content: '', url: '', file: null });
    }
  };

  // Handle removing evidence
  const removeEvidence = (id) => {
    setEvidenceList(evidenceList.filter(item => item.id !== id));
  };

  // Handle task submission
  const handleSubmitTask = async () => {
    // Check if we have any file evidence
    const hasFiles = evidenceList.some(evidence => evidence.file);
    
    let submissionData;
    
    if (hasFiles) {
      // Create FormData for file uploads
      submissionData = new FormData();
      submissionData.append('note', submissionNote || '');
      
      // Process evidence - separate files from text/link evidence
      const textEvidence = [];
      evidenceList.forEach(evidence => {
        if (evidence.file) {
          // Add file to FormData with field name 'attachments'
          submissionData.append('attachments', evidence.file);
        } else {
          // Add text/link evidence to array
          textEvidence.push({
            type: evidence.type,
            content: evidence.content || '',
            url: evidence.url || ''
          });
        }
      });
      
      // Add text evidence as JSON string
      submissionData.append('evidence', JSON.stringify(textEvidence));
    } else {
      // Regular JSON submission for text/link evidence only
      submissionData = {
        note: submissionNote,
        evidence: evidenceList.map(({ id, file, ...rest }) => rest)
      };
    }

    await onSubmit({ taskId: task._id, data: submissionData });

    // Only reset form on successful submission
    if (!isSubmissionError) {
      setSubmissionNote('');
      setEvidenceList([]);
      setNewEvidence({ type: 'text', content: '', url: '', file: null });
    }
  };

  // Handle dialog close
  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    setSubmissionNote('');
    setEvidenceList([]);
    setNewEvidence({ type: 'text', content: '', url: '', file: null });
  };

  // Get evidence icon
  const getEvidenceIcon = (type) => {
    switch (type) {
      case 'image': return <FileImage size={16} />;
      case 'document': return <FileText size={16} />;
      case 'link': return <LinkIcon size={16} />;
      case 'text': return <MessageSquare size={16} />;
      default: return <FileText size={16} />;
    }
  };

  // Get evidence display text
  const getEvidenceDisplayText = (evidence) => {
    if (evidence.type === 'text') {
      return evidence.content;
    } else if (evidence.file) {
      return `${evidence.file.name}`;
    } else {
      return evidence.url;
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Content className='max-w-3xl'>
        <Dialog.Title>{submitButtonText}</Dialog.Title>
        <Dialog.Description>
          Add any notes and evidence to show you've completed this task: <strong>{task?.title}</strong>
        </Dialog.Description>

        <Flex direction="column" gap="4" mt="4">
          {/* Submission Note */}
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">Completion Notes (Optional)</Text>
            <TextArea
              placeholder="Describe how you completed the task, any challenges you faced, or additional comments..."
              value={submissionNote}
              onChange={(e) => setSubmissionNote(e.target.value)}
              rows={4}
              resize={'vertical'}
            />
          </Flex>

          {/* Evidence Section */}
          <Flex direction="column" gap="3">
            <Text size="2" weight="medium">Evidence (Optional)</Text>

            {/* Existing Evidence */}
            {evidenceList.length > 0 && (
              <Flex direction="column" gap="3">
                {evidenceList.map((evidence) => (
                  <Card key={evidence.id} variant="surface" size="1">
                    <Flex align="start" gap="3">
                      {getEvidenceIcon(evidence.type)}
                      <Flex direction="column" gap="1" style={{ flex: 1 }}>
                        <Text size="1" weight="medium" className="capitalize">{evidence.type}</Text>
                        <Text title={getEvidenceDisplayText(evidence)} as='p' size="1" color="gray" className={evidence.type === 'text' ? 'whitespace-pre-wrap' :  'line-clamp-1 break-all'}>
                          {getEvidenceDisplayText(evidence)}
                        </Text>
                      </Flex>
                      <IconButton
                        size="1"
                        variant="ghost"
                        color="gray"
                        onClick={() => removeEvidence(evidence.id)}
                      >
                        <X size={14} />
                      </IconButton>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            )}

            {/* Add Evidence */}
            <Card variant="surface" size="1">
              <Flex direction="column" gap="3">
                <Text size="2" weight="medium">Add Evidence</Text>
                <Flex gap="3" direction={'column'} wrap="wrap">
                  <Flex direction="column" gap="2" style={{ flex: 1 }}>
                    <Text size="1">Type</Text>
                    <Select.Root
                      value={newEvidence.type}
                      onValueChange={(value) => setNewEvidence({ 
                        type: value, 
                        content: '', 
                        url: '', 
                        file: null 
                      })}
                    >
                      <Select.Trigger className="w-full" />
                      <Select.Content position='popper' variant='soft'>
                        <Select.Item value="text">Text Description</Select.Item>
                        <Select.Item value="image">Upload Image</Select.Item>
                        <Select.Item value="document">Upload Document</Select.Item>
                        <Select.Item value="link">Link/URL</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Flex>

                  <Flex direction="column" gap="2" style={{ flex: 2 }}>
                    <Text size="1">
                      {newEvidence.type === 'text' 
                        ? 'Description' 
                        : newEvidence.type === 'link'
                        ? 'URL'
                        : 'File Upload'
                      }
                    </Text>
                    
                    {newEvidence.type === 'text' ? (
                      <TextArea
                        placeholder="Describe your evidence..."
                        value={newEvidence.content}
                        onChange={(e) => setNewEvidence({ ...newEvidence, content: e.target.value })}
                        resize={'vertical'}
                      />
                    ) : newEvidence.type === 'link' ? (
                      <TextField.Root
                        placeholder="Enter URL..."
                        value={newEvidence.url}
                        onChange={(e) => setNewEvidence({ ...newEvidence, url: e.target.value })}
                      />
                    ) : (
                      <Flex direction="column" gap="2">
                        <Button
                          type="button"
                          variant="outline"
                          asChild
                          className="w-full cursor-pointer"
                        >
                          <label>
                            <Upload size={16} />
                            {newEvidence.file ? 'Change File' : 'Select File'}
                            <input
                              type="file"
                              className="hidden"
                              accept={
                                newEvidence.type === 'image' 
                                  ? ".jpg,.jpeg,.png,.gif"
                                  : ".pdf,.doc,.docx,.txt,.mp4,.mov,.avi"
                              }
                              onChange={handleFileSelect}
                            />
                          </label>
                        </Button>
                        {newEvidence.file && (
                          <Text size="1" color="gray">
                            Selected: {newEvidence.file.name} ({(newEvidence.file.size / 1024 / 1024).toFixed(2)} MB)
                          </Text>
                        )}
                      </Flex>
                    )}
                  </Flex>

                  <Button
                    className='mt-auto'
                    size="2"
                    onClick={addEvidence}
                    disabled={
                      (newEvidence.type === 'text' && !newEvidence.content.trim()) ||
                      (newEvidence.type === 'link' && !newEvidence.url.trim()) ||
                      (['image', 'document'].includes(newEvidence.type) && !newEvidence.file && !newEvidence.url.trim())
                    }
                  >
                    <Plus size={16} />
                    Add
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </Flex>

        <Flex gap="3" mt="6" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </Dialog.Close>
          <Button onClick={handleSubmitTask} disabled={isSubmitting}>
            <Upload size={16} />
            {isSubmitting ? 'Submitting...' : submitButtonText}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default TaskSubmissionDialog; 