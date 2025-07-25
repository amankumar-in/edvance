import { Avatar, Badge, Button, Callout, Card, DataList, Dialog, Flex, Text } from '@radix-ui/themes'
import { CheckCircle, FileImage, LinkIcon, MessageSquare, XCircle } from 'lucide-react'
import React from 'react'
import { formatDate } from '../utils/helperFunctions'

function TaskClaimDetailsDialog({
  isDetailsModalOpen,
  setIsDetailsModalOpen,
  selectedClaim,
  getStatusColor,
}) {
  return (
    <Dialog.Root open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
      <Dialog.Content className='max-w-2xl'>
        <Dialog.Title>
          {selectedClaim?.task?.title || '[Deleted Task]'}
        </Dialog.Title>
        <Dialog.Description size="2" mb="6" className='whitespace-pre-wrap'>
          {selectedClaim?.task?.description || 'N/A'}
        </Dialog.Description>
        {selectedClaim && (
          <div>
            <Flex gap='4' className='flex-col sm:flex-row'>
              <Avatar
                src={selectedClaim?.childDetails?.avatar}
                fallback={
                  (selectedClaim?.childDetails?.firstName?.charAt(0) || '') + (selectedClaim?.childDetails?.lastName?.charAt(0) || '') || '?'
                }
                radius='full'
                size='6'
              />

              <DataList.Root>
                <DataList.Item>
                  <DataList.Label minWidth="88px">Name</DataList.Label>
                  <DataList.Value>
                    {selectedClaim?.childDetails?.firstName} {selectedClaim.childDetails?.lastName || '[Unknown Student]'}
                  </DataList.Value>
                </DataList.Item>
                <DataList.Item>
                  <DataList.Label minWidth="88px">Email</DataList.Label>
                  <DataList.Value>
                    {selectedClaim?.childDetails?.email || 'N/A'}
                  </DataList.Value>
                </DataList.Item>
                <DataList.Item>
                  <DataList.Label minWidth="88px">Grade</DataList.Label>
                  <DataList.Value>
                    {selectedClaim?.childDetails?.grade || 'N/A'}
                  </DataList.Value>
                </DataList.Item>
                <DataList.Item>
                  <DataList.Label minWidth="88px">Points</DataList.Label>
                  <DataList.Value>
                    {selectedClaim?.task?.pointValue || 'N/A'}
                  </DataList.Value>
                </DataList.Item>
                <DataList.Item>
                  <DataList.Label minWidth="88px">Completed At</DataList.Label>
                  <DataList.Value>
                    {selectedClaim.completedAt ? formatDate(selectedClaim.completedAt, { dateStyle: 'medium', timeStyle: 'medium' }) : 'N/A'}
                  </DataList.Value>
                </DataList.Item>
                <DataList.Item>
                  <DataList.Label minWidth="88px">Note</DataList.Label>
                  <DataList.Value className='whitespace-pre-wrap'>
                    {selectedClaim?.note || 'N/A'}
                  </DataList.Value>
                </DataList.Item>
                <DataList.Item>
                  <DataList.Label minWidth="88px">Status</DataList.Label>
                  <DataList.Value>
                    <Badge color={getStatusColor(selectedClaim.status)}>{selectedClaim.status?.replace('_', ' ') || 'Unknown Status'}</Badge>
                  </DataList.Value>
                </DataList.Item>
                <DataList.Item>
                  <DataList.Label minWidth="88px">Evidence</DataList.Label>
                  <DataList.Value>
                    {selectedClaim?.evidence && selectedClaim.evidence.length > 0 ? (
                      <Flex direction="column" gap="2" className='w-full'>
                        {selectedClaim.evidence.map((evidence, index) => (
                          <Card key={index} variant="surface" size="1" >
                            <Flex align="start" gap="2">
                              {evidence.type === 'image' && <FileImage size={14} />}
                              {evidence.type === 'document' && <FileText size={14} />}
                              {evidence.type === 'link' && <LinkIcon size={14} />}
                              {evidence.type === 'text' && <MessageSquare size={14} />}

                              <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
                                <Text as="p" weight="medium" className="leading-none capitalize">
                                  {evidence.type}
                                </Text>

                                {evidence.type === 'text' && evidence.content && (
                                  <Text as="p" className="whitespace-pre-wrap">
                                    {evidence.content}
                                  </Text>
                                )}

                                {evidence.type === 'link' && evidence.url && (
                                  <Text as="p" color="blue" className="break-all line-clamp-1 hover:underline" asChild>
                                    <a href={evidence.url} target="_blank" rel="noopener noreferrer" >
                                      {evidence.url}
                                    </a>
                                  </Text>
                                )}

                                {(evidence.type === 'image' || evidence.type === 'document') && evidence.url && (
                                  <Flex direction="column" gap="1">
                                    <Text as="p" color="blue" className="break-all line-clamp-1 hover:underline" asChild>
                                      <a href={evidence.url} target="_blank" rel="noopener noreferrer">
                                        {evidence.fileName || 'View File'}
                                      </a>
                                    </Text>
                                    {evidence.contentType && (
                                      <Text as='p' size='1' color="gray">
                                        {evidence.contentType}
                                      </Text>
                                    )}
                                  </Flex>
                                )}
                              </Flex>
                            </Flex>
                          </Card>
                        ))}
                      </Flex>
                    ) : (
                      <Text as="p">No evidence provided</Text>
                    )}
                  </DataList.Value>
                </DataList.Item>
              </DataList.Root>
            </Flex>

            {/* Approval Status and History */}
            {selectedClaim.status !== 'pending_approval' && selectedClaim.approvalDate && <Callout.Root variant='surface'
              color={selectedClaim.status === 'approved' ? 'green' : 'red'}
              size="1" mt={'4'}>
              <Callout.Icon>
                {selectedClaim.status === 'approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
              </Callout.Icon>
              <Callout.Text>
                <Text as='p' size="2">
                  This task was {selectedClaim.status === 'approved' ? 'Approved' : 'Rejected'} on <strong>{formatDate(selectedClaim.approvalDate, { dateStyle: 'medium', timeStyle: 'medium' })}</strong>
                </Text>
              </Callout.Text>
              <Text as='p' size="2" className='whitespace-pre-wrap'>
                <strong>Feedback:</strong> {selectedClaim.feedback || 'No feedback provided'}
              </Text>
            </Callout.Root>
            }
          </div>
        )}

        <Flex gap='3' mt='4' justify='end'>
          <Dialog.Close>
            <Button variant='soft' color='gray'>
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default TaskClaimDetailsDialog
