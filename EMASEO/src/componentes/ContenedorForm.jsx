import React from 'react';

const ESTADOS = ['Activo', 'Dañado', 'Retirado'];

function ContenedorForm({ form, onChange, onSubmit, editIndex, onCancel }) {
  return (
    <form className="crud-form" onSubmit={onSubmit}>
      <div>
        <label>Tipo:</label>
        <input name="tipo" value={form.tipo} onChange={onChange} required />
      </div>
      <div>
        <label>Estado:</label>
        <select name="estado" value={form.estado} onChange={onChange}>
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Ubicación:</label>
        <input name="ubicacion" value={form.ubicacion} onChange={onChange} required />
      </div>
      <div>
        <label>Observación:</label>
        <input name="observacion" value={form.observacion} onChange={onChange} />
      </div>
      <button type="submit">{editIndex === null ? 'Agregar' : 'Actualizar'}</button>
      {editIndex !== null && (
        <button type="button" onClick={onCancel}>Cancelar</button>
      )}
    </form>
  );
}

export default ContenedorForm; 