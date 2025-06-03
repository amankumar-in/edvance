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
  const [newEvidence, setNewEvidence] = useState({ type: 'text', content: '', url: '' });

  // Handle adding evidence
  const addEvidence = () => {
    if ((newEvidence.type === 'text' && newEvidence.content) ||
      (['image', 'document', 'link'].includes(newEvidence.type) && newEvidence.url)) {
      setEvidenceList([...evidenceList, { ...newEvidence, id: Date.now() }]);
      setNewEvidence({ type: 'text', content: '', url: '' });
    }
  };

  // Handle removing evidence
  const removeEvidence = (id) => {
    setEvidenceList(evidenceList.filter(item => item.id !== id));
  };

  // Handle task submission
  const handleSubmitTask = async () => {
    const submissionData = {
      taskId: task._id,
      note: submissionNote,
      evidence: evidenceList.map(({ id, ...rest }) => rest) // Remove temporary id
    };

    await onSubmit(submissionData);

    // Only reset form on successful submission
    if (!isSubmissionError) {
      setSubmissionNote('');
      setEvidenceList([]);
      setNewEvidence({ type: 'text', content: '', url: '' });
    }
  };

  // Handle dialog close
  const handleClose = () => {
    onOpenChange(false);
    // Reset form when closing
    setSubmissionNote('');
    setEvidenceList([]);
    setNewEvidence({ type: 'text', content: '', url: '' });
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="600px">
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
            />
          </Flex>

          {/* Evidence Section */}
          <Flex direction="column" gap="3">
            <Text size="2" weight="medium">Evidence (Optional)</Text>

            {/* Existing Evidence */}
            {evidenceList.length > 0 && (
              <Flex direction="column" gap="2">
                {evidenceList.map((evidence) => (
                  <Card key={evidence.id} variant="surface" size="1">
                    <Flex align="center" gap="3" p="2">
                      {getEvidenceIcon(evidence.type)}
                      <Flex direction="column" gap="1" style={{ flex: 1 }}>
                        <Text size="1" weight="medium" className="capitalize">{evidence.type}</Text>
                        <Text size="1" color="gray" className="truncate">
                          {evidence.type === 'text' ? evidence.content : evidence.url}
                        </Text>
                      </Flex>
                      <IconButton
                        size="1"
                        variant="ghost"
                        color="red"
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
            <Card variant="surface" size="2">
              <Flex direction="column" gap="3">
                <Text size="2" weight="medium">Add Evidence</Text>

                <Flex gap="3" align="start">
                  <Flex direction="column" gap="2" style={{ flex: 1 }}>
                    <Text size="1">Type</Text>
                    <Select.Root
                      value={newEvidence.type}
                      onValueChange={(value) => setNewEvidence({ ...newEvidence, type: value, content: '', url: '' })}
                    >
                      <Select.Trigger className="w-full" />
                      <Select.Content>
                        <Select.Item value="text">Text Description</Select.Item>
                        <Select.Item value="image">Image</Select.Item>
                        <Select.Item value="document">Document</Select.Item>
                        <Select.Item value="link">Link/URL</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Flex>

                  <Flex direction="column" gap="2" style={{ flex: 2 }}>
                    <Text size="1">
                      {newEvidence.type === 'text' ? 'Description' : 'URL/File'}
                    </Text>
                    {newEvidence.type === 'text' ? (
                      <TextArea
                        placeholder="Describe your evidence..."
                        value={newEvidence.content}
                        onChange={(e) => setNewEvidence({ ...newEvidence, content: e.target.value })}
                        rows={2}
                      />
                    ) : (
                      <TextField.Root
                        placeholder={`Enter ${newEvidence.type} URL or upload file...`}
                        value={newEvidence.url}
                        onChange={(e) => setNewEvidence({ ...newEvidence, url: e.target.value })}
                      />
                    )}
                  </Flex>

                  <Button
                    className='mt-auto'
                    size="2"
                    onClick={addEvidence}
                    disabled={
                      (newEvidence.type === 'text' && !newEvidence.content.trim()) ||
                      (newEvidence.type !== 'text' && !newEvidence.url.trim())
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