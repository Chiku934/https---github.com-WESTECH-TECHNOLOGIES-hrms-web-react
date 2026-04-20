import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import TimesheetGridEmptyOverlay from './TimesheetGridEmptyOverlay';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function TimesheetAgGrid({
  rowData,
  columnDefs,
  pagination = true,
  paginationPageSize = 6,
  noRowsTitle = 'No records found',
  noRowsSubtitle = 'Try adjusting the filters or search terms.',
  onSelectionChanged,
  onRowClicked,
  getRowId,
  rowSelection = undefined,
  domLayout = 'autoHeight',
  ...gridProps
}) {
  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,
    suppressMovable: true,
  }), []);

  return (
    <div className="timesheet-grid-shell timesheet-ag-grid-shell">
      <AgGridReact
        theme="legacy"
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        domLayout={domLayout}
        animateRows
        getRowId={getRowId}
        rowSelection={rowSelection}
        suppressCellFocus
        pagination={pagination}
        paginationPageSize={paginationPageSize}
        paginationPageSizeSelector={[6, 10, 15]}
        headerHeight={46}
        rowHeight={48}
        noRowsOverlayComponent={TimesheetGridEmptyOverlay}
        noRowsOverlayComponentParams={{
          title: noRowsTitle,
          subtitle: noRowsSubtitle,
        }}
        onSelectionChanged={onSelectionChanged}
        onRowClicked={onRowClicked}
        {...gridProps}
      />
    </div>
  );
}
