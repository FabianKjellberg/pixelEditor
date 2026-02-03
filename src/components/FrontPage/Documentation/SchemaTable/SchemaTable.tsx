import React from 'react';
import styles from '../Documentation.module.css';

export type TableColumn = {
  name: string;
  type: string;
  constraints: string;
  description: string;
};

type SchemaTableProps = {
  tableName: string;
  columns: TableColumn[];
};

const SchemaTable = ({ tableName, columns }: SchemaTableProps) => {
  return (
    <>
      <p className={styles.tableName}>{tableName}</p>
      <div className={styles.tableWrapper}>
        <table className={styles.schemaTable}>
          <thead>
            <tr>
              <th>Column</th>
              <th>Type</th>
              <th>Constraints</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col) => (
              <tr key={col.name}>
                <td>{col.name}</td>
                <td>{col.type}</td>
                <td>{col.constraints}</td>
                <td>{col.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SchemaTable;
