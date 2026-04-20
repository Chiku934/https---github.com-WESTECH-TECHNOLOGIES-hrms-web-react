import React from 'react';
import Icon from '../../../../components/Icon';

export default function TimesheetGridHeader(props) {
  const {
    displayName,
    headerIcon = 'list',
    column,
    showFilter,
    enableFilterButton = true,
    showMenu = true,
    progressSort,
  } = props;

  const isFiltered = Boolean(column?.isFilterActive?.());
  const sortDirection = column?.getSort?.();
  const showFilterButton = enableFilterButton && showMenu;

  return (
    <div className="timesheet-grid-header">
      <button
        type="button"
        className="timesheet-grid-header-sort"
        onClick={() => progressSort?.(false)}
        aria-label={`Sort ${displayName}`}
      >
        <Icon name={headerIcon} size={11} />
        <span className="timesheet-grid-header-title">{displayName}</span>
        <span className={`timesheet-grid-sort-icons ${sortDirection ? 'is-sorted' : ''}`}>
          <Icon name="arrow-up" size={9} className={sortDirection === 'asc' ? 'is-active' : ''} />
          <Icon name="arrow-down" size={9} className={sortDirection === 'desc' ? 'is-active' : ''} />
        </span>
      </button>
      {showFilterButton ? (
        <button
          type="button"
          className={`timesheet-grid-header-filter ${isFiltered ? 'active' : ''}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            showFilter?.(event.currentTarget);
          }}
          aria-label={`Filter ${displayName}`}
        >
          <Icon name="filter" size={10} />
        </button>
      ) : null}
      {isFiltered ? <span className="timesheet-grid-header-badge" /> : null}
    </div>
  );
}
