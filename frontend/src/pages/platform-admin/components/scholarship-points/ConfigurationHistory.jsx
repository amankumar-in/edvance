import { Badge, Box, Button, Card, DropdownMenu, Flex, IconButton, Table } from "@radix-ui/themes";
import { Edit, History, MoreVertical, Play, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActivateConfigurationVersion } from "../../../../api/points/points.mutations";
import { useGetConfigurationHistory } from "../../../../api/points/points.queries";
import ConfirmationDialog from "../../../../components/ConfirmationDialog";
import EmptyStateCard from "../../../../components/EmptyStateCard";
import ErrorCallout from "../../../../components/ErrorCallout";
import Loader from "../../../../components/Loader";
import { formatDate } from "../../../../utils/helperFunctions";
import ConfigurationVersionDetails from "./ConfigurationDetails";

// Configuration History Component
const ConfigurationHistory = ({ setConfigDialogOpen, configDialogOpen }) => {
  const { data: historyData, isLoading, isError, error } = useGetConfigurationHistory();
  const activateVersionMutation = useActivateConfigurationVersion();
  const [viewDetailsVersion, setViewDetailsVersion] = useState(null);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [versionToActivate, setVersionToActivate] = useState(null);

  const handleActivateVersion = (version) => {
    activateVersionMutation.mutate(version, {
      onSuccess: () => {
        toast.success(`Configuration version ${version} activated successfully!`);
        setOpenConfirmationDialog(false);
        setVersionToActivate(null);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || error?.message || 'Failed to activate version');
      }
    });
  };

  const handleOpenConfirmationDialog = (version) => {
    setVersionToActivate(version);
    setOpenConfirmationDialog(true);
  };

  const handleCloseConfirmationDialog = () => {
    setOpenConfirmationDialog(false);
    setTimeout(() => {
      setVersionToActivate(null);
    }, 0)
  };

  if (isLoading) {
    return (
      <Flex justify="center">
        <Loader />
      </Flex>
    );
  }

  if (isError) {
    return (
      <ErrorCallout
        errorMessage={error?.response?.data?.message || 'Failed to load configuration history'}
      />
    );
  }

  const history = historyData?.data || [];

  return (
    <>
      <Box className="space-y-4">
        {history.length === 0 ? (
          <EmptyStateCard
            title={'No configuration history available'}
            description={'Create a new configuration to get started.'}
            icon={<History size={24} />}
            action={<Button onClick={() => setConfigDialogOpen(true)}><Plus size={16} />Create Configuration</Button>}
          />
        ) : (
          <Card size={'2'} className='shadow [--card-border-width:0px]'>
            <Table.Root variant="ghost">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell className="font-medium">Version</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-medium">Status</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-medium">Created</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-medium">Updated</Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell className="font-medium">Actions</Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {history.map((config) => (
                  <Table.Row key={config.version} className="hover:bg-[--gray-a3] odd:bg-[--gray-a2]">
                    <Table.Cell>
                      <Badge size="2" color="blue" variant="soft">v{config.version}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {config.isActive ? (
                        <Badge size="2" color="green">Active</Badge>
                      ) : (
                        <Badge size="2" color="gray" variant="soft">Inactive</Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell className="text-nowrap">
                      {formatDate(config.createdAt)}
                    </Table.Cell>
                    <Table.Cell className="text-nowrap">
                      {config.updatedAt ? formatDate(config.updatedAt) : '-'}
                    </Table.Cell>
                    <Table.Cell>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger disabled={activateVersionMutation.isPending}>
                          <IconButton
                            variant="ghost"
                            color="gray"
                          >
                            <MoreVertical size={18} />
                          </IconButton>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content variant="soft">
                          {!config.isActive && (
                            <DropdownMenu.Item
                              onClick={() => handleOpenConfirmationDialog(config.version)}
                              disabled={activateVersionMutation.isPending}
                            >
                              <Play size={14} />
                              Activate Version
                            </DropdownMenu.Item>
                          )}
                          <DropdownMenu.Item onClick={() => setViewDetailsVersion(config.version)}>
                            <Edit size={14} />
                            View Details
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card>
        )}

        {/* Configuration Version Details Dialog */}
        <ConfigurationVersionDetails
          version={viewDetailsVersion}
          open={!!viewDetailsVersion}
          onOpenChange={(open) => !open && setViewDetailsVersion(null)}
        />

        <ConfirmationDialog
          title={'Activate Configuration Version'}
          description={`Are you sure you want to activate version ${versionToActivate}?`}
          open={openConfirmationDialog}
          onOpenChange={handleCloseConfirmationDialog}
          onConfirm={() => handleActivateVersion(versionToActivate)}
          isLoading={activateVersionMutation.isPending}
          confirmText={'Activate'}
          cancelText={'Cancel'}
          confirmColor={'green'}
        />
      </Box>
    </>
  );
};

export default ConfigurationHistory