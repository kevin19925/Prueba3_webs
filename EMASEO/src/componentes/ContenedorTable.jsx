import React from 'react';

function ContenedorTable({ contenedores, onEdit, onDelete }) {
  return (
    <table className="crud-table">
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Ubicación</th>
          <th>Observación</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {contenedores.length === 0 ? (
          <tr><td colSpan="5">No hay contenedores registrados.</td></tr>
        ) : (
          contenedores.map((c, idx) => (
            <tr key={idx}>
              <td>{c.tipo}</td>
              <td>{c.estado}</td>
              <td>{c.ubicacion}</td>
              <td>{c.observacion}</td>
              <td>
                <button onClick={() => onEdit(idx)}>Editar</button>
                <button onClick={() => onDelete(idx)}>Eliminar</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default ContenedorTable; 