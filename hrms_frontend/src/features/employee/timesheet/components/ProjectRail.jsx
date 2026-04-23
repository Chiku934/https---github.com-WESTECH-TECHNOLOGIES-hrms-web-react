import React from 'react';

export default function ProjectRail({ projects, onSelectProject }) {
  return (
    <div className="timesheet-project-rail">
      {projects.map((project) => (
        <button
          key={project.name}
          type="button"
          className={`timesheet-project-item ${project.active ? 'active' : ''}`}
          onClick={() => onSelectProject?.(project)}
        >
          <div className="timesheet-project-item-top">
            <strong>{project.name}</strong>
            <span>{project.code}</span>
          </div>
          <small>{project.client}</small>
        </button>
      ))}
    </div>
  );
}
