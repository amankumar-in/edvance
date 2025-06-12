import { Button, Flex, IconButton, Select, Text } from '@radix-ui/themes';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import React from 'react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  showPageInfo = true,
  showFirstLast = true,
  showPrevNext = true,
  itemsPerPageOptions = [5, 10, 20, 50, 100],
  maxVisiblePages = 5,
  className = '',
  size = '2',
  variant = 'outline',
  disabled = false,
  showTotalCount = true,
  itemLabel = 'items',
  compact = false,
}) => {
  // Validation
  const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
  const validTotalPages = Math.max(1, totalPages);

  // Calculate visible page numbers
  const getVisiblePages = () => {
    if (validTotalPages <= maxVisiblePages) {
      return Array.from({ length: validTotalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, validCurrentPage - half);
    let end = Math.min(validTotalPages, start + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  // Calculate items range for current page
  const startItem = (validCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(validCurrentPage * itemsPerPage, totalItems);

  // Auto-disable if there are no items or only one page
  const shouldDisable = disabled || totalItems === 0;

  // Event handlers
  const handlePageChange = (page) => {
    if (page !== validCurrentPage && page >= 1 && page <= validTotalPages && !shouldDisable) {
      onPageChange?.(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    if (!shouldDisable) {
      const newTotalPages = Math.ceil(totalItems / newItemsPerPage);
      const newCurrentPage = Math.min(validCurrentPage, newTotalPages);
      onItemsPerPageChange?.(parseInt(newItemsPerPage), newCurrentPage);
    }
  };

  if (compact) {
    return (
      <Flex align="center" justify="between" gap="4" className={className}>
        {showPageInfo && (
          <Text size={size} color="gray">
            {totalItems > 0 ? `${startItem}-${endItem} of ${totalItems}` : `0 ${itemLabel}`}
          </Text>
        )}

        <Flex align="center" gap="1">
          <Button
            variant={variant}
            size={size}
            disabled={shouldDisable || validCurrentPage <= 1}
            onClick={() => handlePageChange(validCurrentPage - 1)}
          >
            <ChevronLeft size={16} />
          </Button>

          <Text size={size} className="mx-2">
            {validCurrentPage} / {validTotalPages}
          </Text>

          <Button
            variant={variant}
            size={size}
            disabled={shouldDisable || validCurrentPage >= validTotalPages}
            onClick={() => handlePageChange(validCurrentPage + 1)}
          >
            <ChevronRight size={16} />
          </Button>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="3" className={className}>
      {/* Main pagination controls */}
      <Flex align="center" justify="between" gap="4" wrap="wrap">
        {/* Page info and items per page */}
        <Flex align="center" gap="4" wrap="wrap">
          {showPageInfo && (
            <Text size={size} color="gray">
              {totalItems > 0
                ? showTotalCount
                  ? `Showing ${startItem}-${endItem} of ${totalItems} ${itemLabel}`
                  : `${startItem}-${endItem} of ${totalItems}`
                : `No ${itemLabel} found`
              }
            </Text>
          )}

          {showItemsPerPage && itemsPerPageOptions.length > 1 && (
            <Flex align="center" gap="2">
              <Text size={size} color="gray">Show:</Text>
              <Select.Root
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
                disabled={shouldDisable}
              >
                <Select.Trigger size={size} />
                <Select.Content variant="soft" position="popper">
                  {itemsPerPageOptions.map((option) => (
                    <Select.Item key={option} value={option.toString()}>
                      {option}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Text size={size} color="gray">per page</Text>
            </Flex>
          )}
        </Flex>

        {/* Page navigation */}
        <Flex align="center" gap="1" wrap="wrap">
          {/* First page */}
          {showFirstLast && (
            <IconButton
              variant={variant}
              size={size}
              disabled={shouldDisable || validCurrentPage <= 1}
              onClick={() => handlePageChange(1)}
              title="First page"
            >
              <ChevronsLeft size={16} />
            </IconButton>
          )}

          {/* Previous page */}
          {showPrevNext && (
            <IconButton
              variant={variant}
              size={size}
              disabled={shouldDisable || validCurrentPage <= 1}
              onClick={() => handlePageChange(validCurrentPage - 1)}
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </IconButton>
          )}

          {/* Page numbers */}
          {validTotalPages > 0 ? (
            visiblePages.map((page) => (
              <IconButton
                key={page}
                variant={page === validCurrentPage ? 'solid' : variant}
                size={size}
                disabled={shouldDisable}
                onClick={() => handlePageChange(page)}
                className='text-sm'
              >
                {page}
              </IconButton>
            ))
          ) : (
            <IconButton
              variant="solid"
              size={size}
              disabled={true}
              className='text-sm'
            >
              1
            </IconButton>
          )}

          {/* Next page */}
          {showPrevNext && (
            <IconButton
              variant={variant}
              size={size}
              disabled={shouldDisable || validCurrentPage >= validTotalPages}
              onClick={() => handlePageChange(validCurrentPage + 1)}
              title="Next page"
            >
              <ChevronRight size={16} />
            </IconButton>
          )}

          {/* Last page */}
          {showFirstLast && (
            <IconButton
              variant={variant}
              size={size}
              disabled={shouldDisable || validCurrentPage >= validTotalPages}
              onClick={() => handlePageChange(validTotalPages)}
              title="Last page"
            >
              <ChevronsRight size={16} />
            </IconButton>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Pagination; 