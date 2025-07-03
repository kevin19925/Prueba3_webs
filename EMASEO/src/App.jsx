import { useState } from 'react'
import './App.css'
import ContenedorForm from './componentes/ContenedorForm'
import ContenedorTable from './componentes/ContenedorTable'

///  quiero hacer   un crud para  coontenedores  de basura entonces los contenedores  tienen tipo ,  estado (activo , dañado , retirado )  , ubicacion ,  obsevacion 

const ESTADOS = ['Activo', 'Dañado', 'Retirado'];

function App() {
  const [contenedores, setContenedores] = useState([]);
  const [form, setForm] = useState({ tipo: '', estado: 'Activo', ubicacion: '', observacion: '' });
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.tipo.trim() === '' || form.ubicacion.trim() === '') return;
    if (editIndex === null) {
      setContenedores([...contenedores, form]);
    } else {
      const nuevos = [...contenedores];
      nuevos[editIndex] = form;
      setContenedores(nuevos);
      setEditIndex(null);
    }
    setForm({ tipo: '', estado: 'Activo', ubicacion: '', observacion: '' });
  };

  const handleEdit = (idx) => {
    setForm(contenedores[idx]);
    setEditIndex(idx);
  };

  const handleDelete = (idx) => {
    setContenedores(contenedores.filter((_, i) => i !== idx));
    if (editIndex === idx) {
      setForm({ tipo: '', estado: 'Activo', ubicacion: '', observacion: '' });
      setEditIndex(null);
    }
  };

  const handleCancel = () => {
    setForm({ tipo: '', estado: 'Activo', ubicacion: '', observacion: '' });
    setEditIndex(null);
  };

  return (
    <div className="crud-container">
      <h1>EMASEO EP</h1>
      <ContenedorForm
        form={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        editIndex={editIndex}
        onCancel={handleCancel}
      />
      <ContenedorTable
        contenedores={contenedores}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default App
