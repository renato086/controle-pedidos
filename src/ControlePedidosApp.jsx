import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Plus, Trash } from 'lucide-react';
import logo from "@/assets/logo.png";
import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";

export default function ControlePedidosApp() {
  const [cliente, setCliente] = useState('');
  const [items, setItems] = useState([{ produto: '', quantidade: '', unitario: '' }]);
  const [statusOptions] = useState(['PREPARO', 'FINALIZADO', 'ENTREGUE']);
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "pedidos"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, snapshot => {
      const dados = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPedidos(dados);
    });
    return () => unsubscribe();
  }, []);

  function handleItemChange(idx, field, value) {
    const newItems = [...items];
    newItems[idx][field] = value;
    setItems(newItems);
  }

  function addItemRow() {
    setItems([...items, { produto: '', quantidade: '', unitario: '' }]);
  }

  function removeItemRow(idx) {
    setItems(items.filter((_, i) => i !== idx));
  }

  async function adicionarPedido() {
    if (!cliente || items.some(i => !i.produto || !i.quantidade || !i.unitario)) return;
    const itemsToSave = items.map(i => {
      const q = parseInt(i.quantidade, 10);
      const u = parseFloat(i.unitario);
      return { produto: i.produto, quantidade: q, unitario: u, total: q * u };
    });
    await addDoc(collection(db, "pedidos"), {
      cliente,
      items: itemsToSave,
      status: 'PREPARO',
      timestamp: serverTimestamp()
    });
    setCliente('');
    setItems([{ produto: '', quantidade: '', unitario: '' }]);
  }

  async function removerPedido(id) {
    await deleteDoc(doc(db, "pedidos", id));
  }

  async function changeStatus(id, newStatus) {
    await updateDoc(doc(db, "pedidos", id), { status: newStatus });
  }

  function rowBg(status) {
    switch (status) {
      case 'PREPARO': return 'bg-yellow-100';
      case 'FINALIZADO': return 'bg-green-100';
      case 'ENTREGUE': return 'bg-gray-200';
      default: return '';
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-center mb-4">
        <img src={logo} alt="Logo Mundo Nerd" className="h-[60px] w-auto max-w-[160px] object-contain" />
      </div>
      <div className="max-w-3xl mx-auto bg-white/80 rounded-xl p-6 shadow-lg space-y-6">
        <h1 className="text-3xl font-bold text-center">📦 Controle de Pedidos 🚀</h1>

        <Card>
          <CardContent className="p-4 space-y-4">
            <Input
              placeholder="Nome do Cliente"
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              className="w-full"
            />
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                <Input
                  placeholder="Produto"
                  value={item.produto}
                  onChange={e => handleItemChange(idx, 'produto', e.target.value)}
                />
                <Input
                  placeholder="Quantidade"
                  type="number"
                  value={item.quantidade}
                  onChange={e => handleItemChange(idx, 'quantidade', e.target.value)}
                />
                <Input
                  placeholder="Valor Unitário"
                  type="number"
                  value={item.unitario}
                  onChange={e => handleItemChange(idx, 'unitario', e.target.value)}
                />
                <div className="flex items-center">
                  <Button variant="destructive" size="sm" onClick={() => removeItemRow(idx)}>
                    <Trash className="w-4 h-4 mx-auto" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={addItemRow} className="flex-1 sm:flex-none">
                <Plus className="w-4 h-4 mr-1" />Adicionar Item
              </Button>
              <Button onClick={adicionarPedido} className="flex-1 sm:flex-none">
                Registrar Pedido
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map(p => {
                  const totalPedido = p.items.reduce((sum, i) => sum + (i.total || 0), 0);
                  return (
                    <TableRow key={p.id} className={rowBg(p.status)}>
                      <TableCell>{p.cliente}</TableCell>
                      <TableCell>
                        {p.timestamp?.toDate().toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        {p.items.map((i, j) => (
                          <div key={j}>
                            {i.produto} x{i.quantidade} @ R$ {i.unitario.toFixed(2)} = R$ {i.total.toFixed(2)}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell className="font-bold">R$ {totalPedido.toFixed(2)}</TableCell>
                      <TableCell>
                        <Select
                          value={p.status}
                          onValueChange={val => changeStatus(p.id, val)}
                          className="w-full"
                        >
                          {statusOptions.map(opt => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => removerPedido(p.id)}>
                          <Trash className="w-4 h-4 mx-auto" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {pedidos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-400">
                      Nenhum pedido registrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
