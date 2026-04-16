"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COLLECTIONS, createDocument, updateDocument, getDocuments, getNextNumber } from "@/lib/firestore";
import { useAuth } from "@/lib/auth-context";
import { generateEstimatePDF } from "@/lib/pdf-generator";

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */
interface CustomField {
  id: number;
  label: string;
  value: string;
}

interface LineItem {
  id: number;
  name: string;
  description: string;
  unit: string;
  hsnCode: string;
  qty: number;
  rate: number;
  tax: number;
  isService: boolean;
  customFields: CustomField[];
}

interface Client {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}

interface TaxConfig {
  mode: "exclusive" | "inclusive"; // exclusive = added on top, inclusive = included in price
  onBill: boolean;
  defaultRate: number;
}

interface TermItem {
  id: number;
  text: string;
}

interface Props {
  locale: string;
  initialData?: any;
  isDuplicate?: boolean;
}

/* ═══════════════════════════════════════════════════════
   TRANSLATIONS
   ═══════════════════════════════════════════════════════ */
const labels = {
  es: {
    pageTitle: "Crear estimación",
    breadcrumb: ["Tablero", "Lista de presupuesto", "Crear estimación"],
    back: "Cotizaciones",
    // Left sidebar config
    sidebarEstConfig: "Configuración de estimación",
    sidebarDiscount: "Descuento",
    discountOnInvoice: "Descuento en factura",
    discountOnItem: "Descuento por ítem",
    sidebarTaxConfig: "Configuración de impuestos",
    taxLabel: "Impuesto",
    taxEdit: "Editar",
    taxExclusive: "Exclusivo",
    taxInBill: "En Bill",
    sidebarTodayEst: "Estimaciones generadas hoy",
    noEstToday: "Sin estimaciones hoy",
    // Header
    clientName: "nombre del cliente",
    searchClient: "Buscar y seleccionar cliente",
    addNewClient: "Agregar nuevo cliente",
    estimateTitle: "COTIZACIÓN",
    estimatedDate: "Fecha estimada",
    estimateNo: "Estimación No.",
    validField: "Válido",
    validNA: "NA",
    // Header note
    addHeaderNote: "Agregar nota de cabeza",
    headerNotePlaceholder: "Escriba una nota de cabeza para esta estimación...",
    // Table
    colNum: "N°",
    colProduct: "Producto",
    colQty: "Cantidad",
    colRate: "Tarifa",
    colTax: "Impuesto",
    colAmount: "Monto",
    colAction: "Acción",
    // Inline item
    typeOrSelect: "Escriba o seleccione el elemento",
    descriptionLabel: "Descripción",
    unitLabel: "Unidad",
    hsnLabel: "Código HSN",
    // Buttons
    scanBtn: "Escanear",
    addItemBtn: "Añadir artículo",
    // Edit modal
    editModalTitle: "Elemento de edición",
    editModalTotal: "Total:",
    nameField: "Nombre",
    rateField: "Tarifa",
    qtyField: "Cantidad",
    isService: "Es servicio",
    productType: "Producto",
    serviceType: "Servicio",
    customField: "Campo personalizado",
    addCustomField: "Agregar campo personalizado",
    taxRates: "Las tasas de impuestos",
    cancelBtn: "Cancelar",
    updateBtn: "Actualizar",
    // Terms
    termsTitle: "Términos y condiciones",
    addTerms: "Agregar términos",
    noRecords: "No se encontraron registros",
    termPlaceholder: "Escriba el término...",
    // Custom fields global
    globalCustomField: "Campo personalizado",
    // Totals
    subtotalLabel: "Total Parcial",
    discountLabel: "Descuento",
    discountPct: "%",
    taxPctLabel: "Impuesto",
    pctSymbol: "%",
    totalLabel: "TOTAL",
    // Actions
    cancelAction: "Cancelar",
    saveEstimate: "Salvar la estimación",
    // Misc
    currency: "USD",
    taxRate: 16,
    // Catalog
    catalogItems: [] as { sku: string; name: string; desc: string; unit: string; price: number }[],
    savedClients: [] as { name: string; company: string; email: string; phone: string; address: string }[],
    // Terms templates
    termsTemplates: [
      "Garantía de 12 meses en hardware y mano de obra.",
      "Vigencia de cotización: 15 días calendario.",
      "Se requiere un anticipo del 50% para iniciar el proyecto.",
      "El tiempo estimado de entrega está sujeto a disponibilidad de stock.",
    ],
    todayEstimates: [] as { id: string; client: string; amount: number }[],
    // Add Client modal labels
    clientPhone: "Teléfono",
    clientEmail: "Correo electrónico",
    clientAddress: "Dirección",
    clientCompany: "Empresa / Proyecto",
    saveClient: "Guardar Cliente",
    errorClientCreate: "Error al crear el cliente",
    successClientCreate: "Cliente creado con éxito",
    // Payment
    paymentTitle: "Métodos de Pago",
    bothMethods: "Ambos",
    bankTransfer: "Transferencia Bancaria",
    paypalPayment: "Pago con PayPal (5.7% comisión)",
    bankInfo: "Información Bancaria",
    bankNameLabel: "Banco",
    accountNumLabel: "N° de Cuenta",
    accountTypeLabel: "Tipo de cuenta",
    currencyLabel: "Moneda",
    swiftLabel: "SWIFT/BIC",
    paypalCommission: "Comisión PayPal (5.7%)",
    totalWithPaypal: "Total con PayPal",
  },
  en: {
    pageTitle: "Create Estimate",
    breadcrumb: ["Dashboard", "Estimate List", "Create Estimate"],
    back: "Quotes",
    sidebarEstConfig: "Estimate Configuration",
    sidebarDiscount: "Discount",
    discountOnInvoice: "Discount on invoice",
    discountOnItem: "Discount per item",
    sidebarTaxConfig: "Tax Configuration",
    taxLabel: "Tax",
    taxEdit: "Edit",
    taxExclusive: "Exclusive",
    taxInBill: "On Bill",
    sidebarTodayEst: "Estimates generated today",
    noEstToday: "No estimates today",
    clientName: "client name",
    searchClient: "Search and select client",
    addNewClient: "Add new client",
    estimateTitle: "QUOTATION",
    estimatedDate: "Estimated date",
    estimateNo: "Estimate No.",
    validField: "Valid",
    validNA: "NA",
    addHeaderNote: "Add header note",
    headerNotePlaceholder: "Type a header note for this estimate...",
    colNum: "N°",
    colProduct: "Product",
    colQty: "Quantity",
    colRate: "Rate",
    colTax: "Tax",
    colAmount: "Amount",
    colAction: "Action",
    typeOrSelect: "Type or select item",
    descriptionLabel: "Description",
    unitLabel: "Unit",
    hsnLabel: "HSN Code",
    scanBtn: "Scan",
    addItemBtn: "Add item",
    editModalTitle: "Edit Item",
    editModalTotal: "Total:",
    nameField: "Name",
    rateField: "Rate",
    qtyField: "Quantity",
    isService: "Is service",
    productType: "Product",
    serviceType: "Service",
    customField: "Custom field",
    addCustomField: "Add custom field",
    taxRates: "Tax rates",
    cancelBtn: "Cancel",
    updateBtn: "Update",
    termsTitle: "Terms & Conditions",
    addTerms: "Add terms",
    noRecords: "No records found",
    termPlaceholder: "Type the term...",
    globalCustomField: "Custom field",
    subtotalLabel: "Subtotal",
    discountLabel: "Discount",
    discountPct: "%",
    taxPctLabel: "Tax",
    pctSymbol: "%",
    totalLabel: "TOTAL",
    cancelAction: "Cancel",
    saveEstimate: "Save estimate",
    currency: "USD",
    taxRate: 16,
    catalogItems: [] as { sku: string; name: string; desc: string; unit: string; price: number }[],
    savedClients: [] as { name: string; company: string; email: string; phone: string; address: string }[],
    termsTemplates: [
      "12-month warranty on hardware and labor.",
      "Quote validity: 15 calendar days.",
      "50% down payment required to start the project.",
      "Estimated delivery time subject to stock availability.",
    ],
    todayEstimates: [] as { id: string; client: string; amount: number }[],
    // Add Client modal labels
    clientPhone: "Phone",
    clientEmail: "Email",
    clientAddress: "Address",
    clientCompany: "Company / Project",
    saveClient: "Save Client",
    errorClientCreate: "Error creating client",
    successClientCreate: "Client created successfully",
    // Payment
    paymentTitle: "Payment Methods",
    bothMethods: "Both",
    bankTransfer: "Bank Transfer",
    paypalPayment: "PayPal (5.7% commission)",
    bankInfo: "Banking Information",
    bankNameLabel: "Bank",
    accountNumLabel: "Account Number",
    accountTypeLabel: "Account Type",
    currencyLabel: "Currency",
    swiftLabel: "SWIFT/BIC",
    paypalCommission: "PayPal Fee (5.7%)",
    totalWithPaypal: "Total with PayPal",
  },
};

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */
function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

let nextId = 2;
let nextCfId = 1;
let nextTermId = 1;
let nextGlobalCfId = 1;

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function EstimateProForm({ locale, initialData, isDuplicate }: Props) {
  const l = locale === "en" ? labels.en : labels.es;
  const router = useRouter();
  const { user } = useAuth();
  
  // File input ref for attachments (used by scan/upload buttons)
  const fileRef = useRef<HTMLInputElement>(null); void fileRef;

  const [isSaving, setIsSaving] = useState(false);

  // Auto-generate estimate number on mount
  useEffect(() => {
    const fetchNextNum = async () => {
      try {
        const next = await getNextNumber(COLLECTIONS.ESTIMATES, "EST-");
        setEstNum(next);
      } catch (e) { console.error(e); }
    };
    fetchNextNum();
  }, []);

  /* ── Sidebar config state ── */
  const [sidebarEstOpen, setSidebarEstOpen] = useState(true);
  const [sidebarTaxOpen, setSidebarTaxOpen] = useState(true);
  const [sidebarTodayOpen, setSidebarTodayOpen] = useState(true);
  const [discountMode, setDiscountMode] = useState<"invoice" | "item">("invoice");
  const [taxConfig, setTaxConfig] = useState<TaxConfig>({ mode: "exclusive", onBill: true, defaultRate: 0 });
  const [showTaxEditor, setShowTaxEditor] = useState(false);

  /* ── Header state ── */
  const [estDate, setEstDate] = useState(new Date().toISOString().slice(0, 10));
  const [estNum, setEstNum] = useState("EST26");
  const [validField, setValidField] = useState("NA");

  /* ── Client state ── */
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [dbClients, setDbClients] = useState<Client[]>([]);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedEstimateId, setSavedEstimateId] = useState<string | null>(null);
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "paypal" | "none" | "both">(initialData?.paymentMethod || "bank");
  const [bankInfo, setBankInfo] = useState({ 
    bankName: "Banreservas", 
    accountNo: "9602227849", 
    accountType: locale === "es" ? "Cuenta de ahorro" : "Savings account",
    currency: "USD",
    swift: "BRRDDOSDXXX",
    titular: "VIRGILIO AUGUSTO CALCAGNO SURUN"
  });
  const [paypalEmail, setPaypalEmail] = useState(initialData?.paypalEmail || "VIRGILIOCALCAGNO@GMAIL.COM");

  const [newClientData, setNewClientData] = useState<Client>({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: ""
  });

  // Load clients from Firestore
  useEffect(() => {
    const loadClients = async () => {
      try {
        const clients = await getDocuments(COLLECTIONS.CLIENTS) as (Client & { id?: string })[];
      // Combine with hardcoded ones for demo if needed, but better use DB
        setDbClients([...(clients as Client[]), ...l.savedClients]);

        // Finalize initialization from initialData
        if (initialData) {
          setItems((initialData.items || []).map((item: LineItem, idx: number) => ({ ...item, id: item.id ?? idx + 1 })));
          setEstNum(isDuplicate ? estNum : initialData.estimateNumber || "");
          setEstDate(isDuplicate ? new Date().toISOString().slice(0, 10) : initialData.date || new Date().toISOString().slice(0, 10));
          setValidField(initialData.validUntil || "NA");
          setHeaderNote(initialData.headerNote || "");
          setShowHeaderNote(!!initialData.headerNote);
          setTermsList(initialData.terms || []);
          setGlobalCustomFields(initialData.customFields || []);
          setDiscountType(initialData.discountType || "%");
          setDiscountValue(initialData.discountValue || 0);
          setTaxPctEnabled(initialData.taxEnabled || false);
          setTaxPctType(initialData.taxType || "%");
          setTaxPctValue(initialData.taxValue || 0);

          if (initialData.clientId) {
             const client = clients.find(c => c.id === initialData.clientId) ||
                            l.savedClients.find(c => (c as any).id === initialData.clientId);
             if (client) setSelectedClient(client as Client);
          }
          
          if (initialData.bankInfo) setBankInfo(initialData.bankInfo);
        }
      } catch (e) {
        console.error("Error loading clients:", e);
        setDbClients(l.savedClients);
      }
    };
    loadClients();
  }, [l.savedClients]);

  /* ── Header note ── */
  const [showHeaderNote, setShowHeaderNote] = useState(false);
  const [headerNote, setHeaderNote] = useState("");

  /* ── Items ── */
  const [items, setItems] = useState<LineItem[]>([
    {
      id: 1,
      name: "Cerradura Smart",
      description: "incluye el Gateway, montaje y configuración.",
      unit: "",
      hsnCode: "",
      qty: 1,
      rate: 170,
      tax: 0,
      isService: false,
      customFields: [],
    },
  ]);

  /* ── Inline new item ── */
  const [inlineName, setInlineName] = useState("");
  const [inlineDesc, setInlineDesc] = useState("");
  const [inlineUnit, setInlineUnit] = useState("");
  const [inlineHsn, setInlineHsn] = useState("");
  const [inlineQty, setInlineQty] = useState(0);
  const [inlineRate, setInlineRate] = useState(0);
  const [showInlineCatalog, setShowInlineCatalog] = useState(false);

  /* ── Edit modal ── */
  const [editItem, setEditItem] = useState<LineItem | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  /* ── Terms ── */
  const [termsList, setTermsList] = useState<TermItem[]>([]);
  const [showAddTerm, setShowAddTerm] = useState(false);
  const [newTermText, setNewTermText] = useState("");

  /* ── Global custom fields ── */
  const [globalCustomFields, setGlobalCustomFields] = useState<CustomField[]>([]);

  /* ── Totals config ── */
  const [discountType, setDiscountType] = useState<"%" | "fixed">("%");
  const [discountValue, setDiscountValue] = useState(0);
  const [taxPctType, setTaxPctType] = useState<"%" | "fixed">("%");
  const [taxPctValue, setTaxPctValue] = useState(0);
  const [taxPctEnabled, setTaxPctEnabled] = useState(false);

  /* ── Mobile sidebar ── */
  const [mobileSidebar, setMobileSidebar] = useState(false);

  /* ═══ CALCULATIONS ═══ */
  const subtotal = items.reduce((sum, item) => sum + item.qty * item.rate, 0);
  const discountAmt = discountType === "%" ? (subtotal * discountValue) / 100 : discountValue;
  const afterDiscount = subtotal - discountAmt;
  const taxAmt = taxPctEnabled
    ? taxPctType === "%" ? (afterDiscount * taxPctValue) / 100 : taxPctValue
    : 0;
  const baseTotal = afterDiscount + taxAmt;
  
  const paypalFee = paymentMethod === "paypal" ? (baseTotal * 0.057) : 0;
  const total = baseTotal + paypalFee;

  /* ═══ HANDLERS ═══ */
  const selectClient = useCallback((c: Client) => {
    setSelectedClient(c);
    setClientSearch("");
    setShowClientDropdown(false);
  }, []);

  const handleCreateClient = async () => {
    if (!newClientData.name.trim()) {
      alert(locale === "es" ? "Por favor ingresa el nombre del cliente" : "Please enter the client name");
      return;
    }
    
    setIsSaving(true);
    try {
      // Usar un timeout para que la UI no se quede bloqueada si Firestore tarda demasiado
      // Aunque con persistencia debería ser casi instantáneo localmente.
      const createPromise = createDocument(COLLECTIONS.CLIENTS, newClientData);
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 3000)
      );

      // Esperamos pero no bloqueamos si el timeout se dispara (la persistencia lo guardará después)
      await Promise.race([createPromise, timeout]).catch(err => {
        console.warn("Save pending or timeout:", err);
      });

      // Actualizar UI localmente de inmediato para que el usuario pueda seguir trabajando
      const createdClient = { ...newClientData };
      setDbClients(prev => [createdClient, ...prev]);
      setSelectedClient(createdClient);
      setShowAddClientModal(false);
      setNewClientData({ name: "", company: "", email: "", phone: "", address: "" });
    } catch (e) {
      console.error(e);
      alert((l as any).errorClientCreate || "Error saving client");
    } finally {
      setIsSaving(false);
    }
  };

  const addInlineItem = useCallback(() => {
    if (!inlineName.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: nextId++,
        name: inlineName,
        description: inlineDesc,
        unit: inlineUnit,
        hsnCode: inlineHsn,
        qty: inlineQty || 1,
        rate: inlineRate,
        tax: 0,
        isService: false,
        customFields: [],
      },
    ]);
    setInlineName("");
    setInlineDesc("");
    setInlineUnit("");
    setInlineHsn("");
    setInlineQty(0);
    setInlineRate(0);
  }, [inlineName, inlineDesc, inlineUnit, inlineHsn, inlineQty, inlineRate]);

  const selectFromCatalog = useCallback((product: typeof l.catalogItems[0]) => {
    setInlineName(product.name);
    setInlineDesc(product.desc);
    setInlineUnit(product.unit);
    setInlineRate(product.price);
    setInlineQty(1);
    setShowInlineCatalog(false);
  }, [l]);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const openEditModal = useCallback((item: LineItem) => {
    setEditItem({ ...item, customFields: [...item.customFields] });
    setEditModalOpen(true);
  }, []);

  const saveEditModal = useCallback(() => {
    if (!editItem) return;
    setItems((prev) => prev.map((i) => (i.id === editItem.id ? editItem : i)));
    setEditModalOpen(false);
    setEditItem(null);
  }, [editItem]);

  const addCustomFieldToEdit = useCallback(() => {
    if (!editItem) return;
    setEditItem({ ...editItem, customFields: [...editItem.customFields, { id: nextCfId++, label: "", value: "" }] });
  }, [editItem]);

  const updateEditCustomField = useCallback((cfId: number, field: "label" | "value", val: string) => {
    if (!editItem) return;
    setEditItem({
      ...editItem,
      customFields: editItem.customFields.map((cf) => (cf.id === cfId ? { ...cf, [field]: val } : cf)),
    });
  }, [editItem]);

  const removeEditCustomField = useCallback((cfId: number) => {
    if (!editItem) return;
    setEditItem({ ...editItem, customFields: editItem.customFields.filter((cf) => cf.id !== cfId) });
  }, [editItem]);

  const addTerm = useCallback(() => {
    if (!newTermText.trim()) return;
    setTermsList((prev) => [...prev, { id: nextTermId++, text: newTermText }]);
    setNewTermText("");
    setShowAddTerm(false);
  }, [newTermText]);

  const removeTerm = useCallback((id: number) => {
    setTermsList((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addGlobalCustomField = useCallback(() => {
    setGlobalCustomFields((prev) => [...prev, { id: nextGlobalCfId++, label: "", value: "" }]);
  }, []);

  const updateGlobalCustomField = useCallback((id: number, field: "label" | "value", val: string) => {
    setGlobalCustomFields((prev) => prev.map((cf) => (cf.id === id ? { ...cf, [field]: val } : cf)));
  }, []);

  const removeGlobalCustomField = useCallback((id: number) => {
    setGlobalCustomFields((prev) => prev.filter((cf) => cf.id !== id));
  }, []);

  const handleSave = async () => {
    if (!selectedClient) {
      alert(locale === "es" ? "Por favor selecciona un cliente" : "Please select a client");
      return;
    }
    if (items.length === 0) {
      alert(locale === "es" ? "Agregue al menos un producto" : "Add at least one product");
      return;
    }

    setIsSaving(true);
    try {
      const estimateData: any = {
        estimateNumber: estNum,
        clientId: (selectedClient as any).id || selectedClient.email || "guest",
        clientName: selectedClient.name,
        clientEmail: selectedClient.email,
        clientCompany: selectedClient.company,
        clientPhone: selectedClient.phone,
        clientAddress: selectedClient.address,
        status: initialData && !isDuplicate ? initialData.status : "draft",
        date: estDate,
        validUntil: validField,
        headerNote,
        items: items.map(i => ({
          name: i.name,
          description: i.description,
          unit: i.unit,
          hsnCode: i.hsnCode,
          qty: i.qty,
          rate: i.rate,
          tax: i.tax,
          isService: i.isService,
          customFields: i.customFields.map(cf => ({ label: cf.label, value: cf.value }))
        })),
        terms: termsList.map(t => ({ text: t.text })),
        customFields: globalCustomFields.map(cf => ({ label: cf.label, value: cf.value })),
        discountType,
        discountValue,
        taxEnabled: taxPctEnabled,
        taxType: taxPctType,
        taxValue: taxPctValue,
        subtotal,
        discountAmt,
        taxAmt,
        paypalFee,
        total,
        paymentMethod,
        bankInfo: (paymentMethod === "bank" || paymentMethod === "both") ? bankInfo : null,
        paypalEmail: (paymentMethod === "paypal" || paymentMethod === "both") ? paypalEmail : null,
        attachments: initialData?.attachments || [],
        createdBy: user?.uid || "anonymous",
        updatedAt: new Date().toISOString(),
      };

      if (initialData && !isDuplicate) {
        await updateDocument(COLLECTIONS.ESTIMATES, initialData.id, estimateData);
        setSavedEstimateId(initialData.id); // needed for share links
      } else {
        estimateData.createdAt = new Date().toISOString();
        const docId = await createDocument(COLLECTIONS.ESTIMATES, estimateData);
        setSavedEstimateId(docId);
      }
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Save error:", error);
      alert(locale === "es" 
        ? "Error al guardar la estimación. Por favor revisa tu conexión." 
        : "Error saving estimate. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = async () => {
    try {
      await generateEstimatePDF({
        estimateNumber: estNum,
        date: estDate,
        validUntil: validField,
        clientName: selectedClient?.name || (locale === "es" ? "Sin cliente" : "No client"),
        clientCompany: selectedClient?.company || "",
        headerNote,
        items: items.map(i => ({
          name: i.name,
          description: i.description,
          qty: i.qty,
          rate: i.rate,
          tax: i.tax,
          unit: i.unit,
        })),
        subtotal,
        discountAmt,
        taxAmt,
        paypalFee,
        total,
        terms: termsList.map(t => ({ text: t.text })),
        paymentMethod,
        bankInfo: paymentMethod === "bank" ? bankInfo : null,
        paypalEmail,
        locale,
      });
    } catch (err) {
      console.error("PDF generation error:", err);
      // Fallback to browser print
      window.print();
    }
  };

  const filteredClients = dbClients.filter(
    (c) => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.company.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const filteredCatalog = l.catalogItems.filter(
    (p) => p.name.toLowerCase().includes(inlineName.toLowerCase()) || p.sku.toLowerCase().includes(inlineName.toLowerCase())
  );

  /* ═══ STYLES ═══ */
  const inputSm = "w-full bg-[#0e0e0e] border border-[#484847]/20 rounded-xl px-3 py-2 text-white placeholder:text-[#484847] focus:ring-1 focus:ring-[#c1fffe] outline-none text-sm transition-all";
  const labelSm = "text-[10px] font-bold uppercase tracking-[0.12em] text-[#767575] mb-1 block";
  const sectionHeader = "flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-[#1a1a1a] rounded-xl transition-colors";

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      {/* ══════════ TOOLBAR ══════════ */}
      <div className="sticky top-0 z-[70] bg-[#0e0e0e]/95 backdrop-blur-xl border-b border-[#484847]/20 px-4 md:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/admin/quotes`} className="flex items-center gap-2 text-[#adaaaa] hover:text-white transition-colors text-sm">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span className="hidden md:inline">{l.back}</span>
            </Link>
            <div className="h-5 w-px bg-[#484847]/30 hidden md:block"></div>
            <span className="font-bold text-[#c1fffe] text-sm">{l.pageTitle}</span>
            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center gap-1 text-[10px] text-[#767575]">
              {l.breadcrumb.map((b, i) => (
                <span key={b} className="flex items-center gap-1">
                  {i > 0 && <span>/</span>}
                  <span className={i === l.breadcrumb.length - 1 ? "text-[#c1fffe]" : ""}>{b}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={generatePDF} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#484847]/30 text-[#adaaaa] hover:text-white hover:border-white transition-all text-xs">
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button onClick={() => alert("Función de compartir activada")} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#484847]/30 text-[#adaaaa] hover:text-white hover:border-white transition-all text-xs">
              <span className="material-symbols-outlined text-sm">share</span>
              <span className="hidden sm:inline">Compartir</span>
            </button>

            {/* Mobile sidebar toggle */}
            <button onClick={() => setMobileSidebar(!mobileSidebar)} className="md:hidden p-2 rounded-xl border border-[#484847]/30 text-[#adaaaa]">
              <span className="material-symbols-outlined text-lg">tune</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ MAIN LAYOUT ══════════ */}
      <div className="flex">
        {/* ─── LEFT SIDEBAR ─── */}
        <aside className={`${mobileSidebar ? "fixed inset-0 z-[80] bg-[#0e0e0e]/95" : "hidden"} md:block md:sticky md:top-[57px] md:h-[calc(100vh-57px)] w-72 border-r border-[#484847]/10 bg-[#0e0e0e] overflow-y-auto flex-shrink-0`}>
          {/* Mobile close */}
          <div className="md:hidden flex justify-end p-4">
            <button onClick={() => setMobileSidebar(false)} className="text-[#adaaaa]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-4 space-y-2">
            {/* ── Estimate Config ── */}
            <div className="bg-[#131313] rounded-2xl border border-[#484847]/10 overflow-hidden">
              <button onClick={() => setSidebarEstOpen(!sidebarEstOpen)} className={sectionHeader + " w-full"}>
                <span className="text-xs font-bold">{l.sidebarEstConfig}</span>
                <span className={`material-symbols-outlined text-[#767575] text-lg transition-transform ${sidebarEstOpen ? "rotate-180" : ""}`}>expand_more</span>
              </button>
              {sidebarEstOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <div>
                    <label className={labelSm}>{l.sidebarDiscount}</label>
                    <select
                      value={discountMode}
                      onChange={(e) => setDiscountMode(e.target.value as "invoice" | "item")}
                      title="Discount mode"
                      className="w-full bg-[#0e0e0e] border border-[#484847]/20 rounded-xl px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-[#c1fffe] appearance-none cursor-pointer"
                    >
                      <option value="invoice">{l.discountOnInvoice}</option>
                      <option value="item">{l.discountOnItem}</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* ── Tax Config ── */}
            <div className="bg-[#131313] rounded-2xl border border-[#484847]/10 overflow-hidden">
              <button onClick={() => setSidebarTaxOpen(!sidebarTaxOpen)} className={sectionHeader + " w-full"}>
                <span className="text-xs font-bold">{l.sidebarTaxConfig}</span>
                <span className={`material-symbols-outlined text-[#767575] text-lg transition-transform ${sidebarTaxOpen ? "rotate-180" : ""}`}>expand_more</span>
              </button>
              {sidebarTaxOpen && (
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#adaaaa]">{l.taxLabel}</span>
                    <button
                      onClick={() => setShowTaxEditor(!showTaxEditor)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg border border-[#c1fffe]/30 text-[#c1fffe] text-[10px] font-bold hover:bg-[#c1fffe]/10 transition-all"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                      {l.taxEdit}
                    </button>
                  </div>

                  {/* Tax mode indicators */}
                  <div className="flex items-center gap-4 text-[10px] mb-3">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${taxConfig.mode === "exclusive" ? "bg-[#c1fffe]" : "bg-[#484847]"}`}></span>
                      <span className={taxConfig.mode === "exclusive" ? "text-[#c1fffe]" : "text-[#767575]"}>{l.taxExclusive}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${taxConfig.onBill ? "bg-[#6e9bff]" : "bg-[#484847]"}`}></span>
                      <span className={taxConfig.onBill ? "text-[#6e9bff]" : "text-[#767575]"}>{l.taxInBill}</span>
                    </span>
                  </div>
                  <p className="text-[#c1fffe] text-sm font-bold">{taxConfig.defaultRate} %</p>

                  {/* Tax editor */}
                  {showTaxEditor && (
                    <div className="mt-3 p-3 bg-[#0e0e0e] rounded-xl border border-[#484847]/10 space-y-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTaxConfig({ ...taxConfig, mode: "exclusive" })}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${taxConfig.mode === "exclusive" ? "bg-[#c1fffe]/20 text-[#c1fffe] border border-[#c1fffe]/30" : "border border-[#484847]/20 text-[#767575]"}`}
                        >{l.taxExclusive}</button>
                        <button
                          onClick={() => setTaxConfig({ ...taxConfig, mode: "inclusive" })}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${taxConfig.mode === "inclusive" ? "bg-[#c1fffe]/20 text-[#c1fffe] border border-[#c1fffe]/30" : "border border-[#484847]/20 text-[#767575]"}`}
                        >{locale === "es" ? "Inclusivo" : "Inclusive"}</button>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={taxConfig.onBill}
                            onChange={(e) => setTaxConfig({ ...taxConfig, onBill: e.target.checked })}
                            className="accent-[#c1fffe] w-3.5 h-3.5"
                          />
                          <span className="text-xs text-[#adaaaa]">{l.taxInBill}</span>
                        </label>
                      </div>
                      <div>
                        <label className={labelSm}>{locale === "es" ? "Tasa por defecto (%)" : "Default rate (%)"}</label>
                        <input
                          type="number"
                          value={taxConfig.defaultRate}
                          onChange={(e) => setTaxConfig({ ...taxConfig, defaultRate: parseFloat(e.target.value) || 0 })}
                          className={inputSm}
                          title="Default tax rate"
                          placeholder="0"
                          min={0}
                          max={100}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Today's Estimates ── */}
            <div className="bg-[#131313] rounded-2xl border border-[#484847]/10 overflow-hidden">
              <button onClick={() => setSidebarTodayOpen(!sidebarTodayOpen)} className={sectionHeader + " w-full"}>
                <span className="text-xs font-bold">{l.sidebarTodayEst}</span>
                <span className={`material-symbols-outlined text-[#767575] text-lg transition-transform ${sidebarTodayOpen ? "rotate-180" : ""}`}>expand_more</span>
              </button>
              {sidebarTodayOpen && (
                <div className="px-4 pb-4">
                  {l.todayEstimates.length > 0 ? (
                    <div className="space-y-2">
                      {l.todayEstimates.map((est) => (
                        <div key={est.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e0e0e] border border-[#484847]/5">
                          <div>
                            <p className="text-xs font-bold text-[#c1fffe]">{est.id}</p>
                            <p className="text-[10px] text-[#767575]">{est.client}</p>
                          </div>
                          <span className="text-xs font-mono">{l.currency} {fmt(est.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#767575]">{l.noEstToday}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 min-w-0">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">

            {/* ═══ CLIENT + META HEADER ═══ */}
            <div className="bg-[#131313] rounded-3xl border border-[#484847]/10 overflow-hidden shadow-2xl mb-6">
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Client selector */}
                  <div className="lg:col-span-7">
                    <label className={labelSm}>{l.clientName}</label>
                    <div className="relative">
                      {selectedClient ? (
                        <div className="flex items-center justify-between bg-[#0e0e0e] rounded-xl px-4 py-3 border border-[#c1fffe]/20">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#c1fffe]/10 flex items-center justify-center text-[#c1fffe] text-xs font-bold">{selectedClient.name.charAt(0)}</div>
                            <div>
                              <p className="text-sm font-medium">{selectedClient.name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[#767575]">{selectedClient.company}</span>
                                {selectedClient.phone && (
                                  <>
                                    <span className="w-1 h-1 rounded-full bg-[#484847]"></span>
                                    <span className="text-[10px] text-[#c1fffe] font-mono">{selectedClient.phone}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => setSelectedClient(null)} className="text-[#767575] hover:text-[#ff716c] transition-colors">
                            <span className="material-symbols-outlined text-base">close</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            value={clientSearch}
                            onChange={(e) => { setClientSearch(e.target.value); setShowClientDropdown(true); }}
                            onFocus={() => setShowClientDropdown(true)}
                            onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                            placeholder={l.searchClient}
                            className={inputSm + " pr-10"}
                          />
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#484847] text-lg">search</span>

                          {showClientDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#484847]/20 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-64 overflow-y-auto">
                              <button
                                onMouseDown={(e) => { e.preventDefault(); setShowAddClientModal(true); }}
                                className="w-full text-left px-4 py-3 hover:bg-[#262626] transition-colors flex items-center gap-2 text-[#c1fffe] border-b border-[#484847]/10"
                              >
                                <span className="material-symbols-outlined text-base">person_add</span>
                                <span className="text-sm font-bold">{(l as any).addNewClient}</span>
                              </button>
                              {filteredClients.map((c, i) => (
                                <button
                                  key={`${c.email}-${i}`}
                                  onMouseDown={(e) => { e.preventDefault(); selectClient(c); }}
                                  className="w-full text-left px-4 py-3 hover:bg-[#262626] transition-colors flex flex-col border-b border-[#484847]/5 last:border-0"
                                >
                                  <span className="text-sm font-bold">{c.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-[#767575]">{c.company}</span>
                                    {c.phone && <span className="text-[10px] text-[#c1fffe]/60 font-mono">{c.phone}</span>}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right meta */}
                  <div className="lg:col-span-5">
                    <div className="text-right mb-4">
                      <h2 className="text-2xl md:text-3xl font-black text-[#c1fffe] tracking-tight">{l.estimateTitle}</h2>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#767575] text-base">calendar_today</span>
                        <div className="flex-1">
                          <label className={labelSm}>{l.estimatedDate}</label>
                          <input type="date" value={estDate} onChange={(e) => setEstDate(e.target.value)} className={inputSm} title="Estimate date" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#767575] text-base">tag</span>
                        <div className="flex-1">
                          <label className={labelSm}>{l.estimateNo}</label>
                          <input value={estNum} onChange={(e) => setEstNum(e.target.value)} className={inputSm + " font-mono"} title="Estimate number" placeholder="EST-001" />
                        </div>
                      </div>
                      <div>
                        <label className={labelSm}>{l.validField}</label>
                        <input value={validField} onChange={(e) => setValidField(e.target.value)} className={inputSm} title="Validity period" placeholder="30 days" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ HEADER NOTE ═══ */}
            <div className="bg-[#131313] rounded-3xl border border-[#484847]/10 overflow-hidden shadow-2xl mb-6">
              <button
                onClick={() => setShowHeaderNote(!showHeaderNote)}
                className="w-full flex items-center gap-3 px-6 md:px-8 py-4 hover:bg-[#1a1a1a] transition-colors"
              >
                <span className="material-symbols-outlined text-[#c1fffe] text-base">add_circle</span>
                <span className="text-sm font-medium">{l.addHeaderNote}</span>
              </button>
              {showHeaderNote && (
                <div className="px-6 md:px-8 pb-6">
                  <textarea
                    value={headerNote}
                    onChange={(e) => setHeaderNote(e.target.value)}
                    placeholder={l.headerNotePlaceholder}
                    rows={3}
                    className={inputSm + " resize-none"}
                  />
                </div>
              )}
            </div>

            {/* ═══ ITEMS TABLE ═══ */}
            <div className="bg-[#131313] rounded-3xl border border-[#484847]/10 overflow-hidden shadow-2xl mb-6">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[40px_1fr_100px_100px_100px_120px_80px] gap-0 bg-[#c1fffe]/10 border-b border-[#484847]/10">
                {[l.colNum, l.colProduct, l.colQty, l.colRate, l.colTax, l.colAmount, l.colAction].map((col) => (
                  <div key={col} className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#c1fffe]">{col}</div>
                ))}
              </div>

              {/* Existing items */}
              {items.map((item, idx) => (
                <div key={item.id} className="border-b border-[#484847]/10 hover:bg-[#1a1a1a]/50 transition-colors">
                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-[40px_1fr_100px_100px_100px_120px_80px] gap-0 items-center">
                    <div className="px-4 py-4 text-sm text-[#767575] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[#484847] text-sm cursor-grab">drag_indicator</span>
                      {idx + 1}
                    </div>
                    <div className="px-4 py-4">
                      <p className="text-sm font-medium">{item.name}</p>
                      {item.description && <p className="text-[11px] text-[#adaaaa] mt-0.5">{item.description}</p>}
                    </div>
                    <div className="px-4 py-4 text-sm">{fmt(item.qty)}</div>
                    <div className="px-4 py-4 text-sm">{l.currency} {fmt(item.rate)}</div>
                    <div className="px-4 py-4 text-sm text-[#767575]">{item.tax > 0 ? `${item.tax}%` : ""}</div>
                    <div className="px-4 py-4 text-sm font-bold">{l.currency} {fmt(item.qty * item.rate)}</div>
                    <div className="px-4 py-4 flex items-center gap-1">
                      <button onClick={() => openEditModal(item)} className="p-1.5 rounded-lg hover:bg-[#c1fffe]/10 text-[#c1fffe] transition-all">
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-[#ff716c]/10 text-[#ff716c] transition-all">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="md:hidden p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        {item.description && <p className="text-[11px] text-[#adaaaa]">{item.description}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEditModal(item)} className="p-1 text-[#c1fffe]"><span className="material-symbols-outlined text-base">edit</span></button>
                        <button onClick={() => removeItem(item.id)} className="p-1 text-[#ff716c]"><span className="material-symbols-outlined text-base">delete</span></button>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-[#adaaaa]">
                      <span>{l.colQty}: {item.qty}</span>
                      <span>{l.colRate}: {l.currency} {fmt(item.rate)}</span>
                      <span className="font-bold text-white">{l.currency} {fmt(item.qty * item.rate)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* ── Inline new item entry ── */}
              <div className="p-4 md:p-6 border-b border-[#484847]/10">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_80px_80px] gap-3 mb-3">
                  {/* Name with catalog dropdown */}
                  <div className="relative">
                    <input
                      value={inlineName}
                      onChange={(e) => { setInlineName(e.target.value); setShowInlineCatalog(true); }}
                      onFocus={() => setShowInlineCatalog(true)}
                      onBlur={() => setTimeout(() => setShowInlineCatalog(false), 200)}
                      placeholder={l.typeOrSelect}
                      className={inputSm}
                    />
                    {showInlineCatalog && inlineName && filteredCatalog.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#484847]/20 rounded-xl overflow-hidden shadow-2xl z-50 max-h-48 overflow-y-auto">
                        {filteredCatalog.map((p) => (
                          <button
                            key={p.sku}
                            onMouseDown={(e) => { e.preventDefault(); selectFromCatalog(p); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-[#262626] transition-colors flex justify-between items-center text-xs border-b border-[#484847]/5 last:border-0"
                          >
                            <div>
                              <span className="text-white">{p.name}</span>
                              <span className="text-[#767575] ml-2">({p.sku})</span>
                            </div>
                            <span className="text-[#c1fffe] font-bold">{fmt(p.price)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input type="number" value={inlineQty || ""} onChange={(e) => setInlineQty(parseFloat(e.target.value) || 0)} placeholder="0" className={inputSm + " text-center"} />
                  <input type="number" value={inlineRate || ""} onChange={(e) => setInlineRate(parseFloat(e.target.value) || 0)} placeholder="0" className={inputSm + " text-right"} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <textarea value={inlineDesc} onChange={(e) => setInlineDesc(e.target.value)} placeholder={l.descriptionLabel} rows={2} className={inputSm + " resize-none"} />
                  <input value={inlineUnit} onChange={(e) => setInlineUnit(e.target.value)} placeholder={l.unitLabel} className={inputSm} />
                  <input value={inlineHsn} onChange={(e) => setInlineHsn(e.target.value)} placeholder={l.hsnLabel} className={inputSm} />
                </div>

                {/* Amount display */}
                <div className="flex items-center justify-between">
                  <div></div>
                  <span className="text-sm font-mono">{l.currency} {fmt(inlineQty * inlineRate)}</span>
                </div>
              </div>

              {/* ── Custom field + Scan/Add buttons ── */}
              <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileRef} 
                    className="hidden" 
                    onChange={(e) => {
                      if(e.target.files?.[0]) {
                        alert(`Archivo seleccionado: ${e.target.files[0].name}. (Procesando con OCR/IA en Fase 3)`);
                      }
                    }} 
                  />
                  <span className="text-xs text-[#767575]">{l.customField}</span>
                  <button className="flex items-center gap-1 text-[#c1fffe] text-xs hover:underline">
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    {l.addCustomField}
                  </button>
                  <span className="material-symbols-outlined text-[#484847] text-sm">expand_more</span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6e9bff]/20 border border-[#6e9bff]/30 text-[#6e9bff] text-xs font-bold hover:bg-[#6e9bff]/30 transition-all font-inter"
                  >
                    <span className="material-symbols-outlined text-sm">document_scanner</span>
                    {l.scanBtn}
                  </button>
                  <button
                    onClick={addInlineItem}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c1fffe] text-[#006767] text-xs font-bold hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    {l.addItemBtn}
                  </button>
                </div>
              </div>
            </div>

            {/* ═══ TERMS + TOTALS ROW ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Terms & Conditions */}
              <div className="bg-[#131313] rounded-3xl border border-[#484847]/10 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#484847]/10">
                  <span className="text-sm font-bold">{l.termsTitle}</span>
                  <button
                    onClick={() => setShowAddTerm(true)}
                    className="flex items-center gap-1 text-[#c1fffe] text-xs font-bold hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    {l.addTerms}
                  </button>
                </div>
                <div className="px-6 py-4">
                  {termsList.length === 0 && !showAddTerm ? (
                    <p className="text-xs text-[#767575] text-center py-4">{l.noRecords}</p>
                  ) : (
                    <div className="space-y-2">
                      {termsList.map((t) => (
                        <div key={t.id} className="flex items-start justify-between bg-[#0e0e0e] rounded-xl px-4 py-3 border border-[#484847]/5">
                          <p className="text-xs text-[#adaaaa] flex-1">{t.text}</p>
                          <button onClick={() => removeTerm(t.id)} className="text-[#767575] hover:text-[#ff716c] ml-2 flex-shrink-0">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {showAddTerm && (
                    <div className="mt-3 space-y-2">
                      {/* Template quick picks */}
                      <div className="space-y-1">
                        {l.termsTemplates.map((tmpl, i) => (
                          <button
                            key={i}
                            onClick={() => { setNewTermText(tmpl as string); }}
                            className="w-full text-left px-3 py-2 rounded-lg bg-[#0e0e0e] border border-[#484847]/5 text-[10px] text-[#adaaaa] hover:border-[#c1fffe]/20 hover:text-[#c1fffe] transition-all line-clamp-1"
                          >
                            {tmpl as string}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={newTermText}
                        onChange={(e) => setNewTermText(e.target.value)}
                        placeholder={l.termPlaceholder}
                        rows={2}
                        className={inputSm + " resize-none"}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => { setShowAddTerm(false); setNewTermText(""); }} className="px-3 py-1.5 rounded-lg border border-[#484847]/20 text-[#767575] text-xs">{l.cancelBtn}</button>
                        <button onClick={addTerm} className="px-3 py-1.5 rounded-lg bg-[#c1fffe] text-[#006767] text-xs font-bold">{l.updateBtn}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-[#131313] rounded-3xl border border-[#484847]/10 overflow-hidden shadow-2xl">
                <div className="px-6 py-4 space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">{l.subtotalLabel}</span>
                    <span className="text-sm font-mono">{l.currency} {fmt(subtotal)}</span>
                  </div>

                  {/* Discount */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm text-[#adaaaa]">{l.discountLabel} ({l.discountPct})</span>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as "%" | "fixed")}
                        title="Discount type"
                        className="bg-[#0e0e0e] border border-[#484847]/20 rounded-lg px-2 py-1 text-xs text-white outline-none"
                      >
                        <option value="%">%</option>
                        <option value="fixed">$</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                        title="Discount value"
                        placeholder="0"
                        className="w-20 bg-[#0e0e0e] border border-[#484847]/20 rounded-lg px-2 py-1.5 text-xs text-center outline-none focus:ring-1 focus:ring-[#c1fffe]"
                      />
                      <span className="text-xs text-[#767575]">{discountType === "%" ? "%" : ""}</span>
                      <span className="text-sm font-mono w-28 text-right">{l.currency} {fmt(discountAmt)}</span>
                    </div>
                  </div>

                  {/* Tax */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={taxPctEnabled}
                          onChange={(e) => setTaxPctEnabled(e.target.checked)}
                          className="accent-[#c1fffe] w-3.5 h-3.5"
                        />
                        <span className="text-sm text-[#adaaaa]">{l.taxPctLabel} ({l.pctSymbol})</span>
                      </label>
                      <select
                        value={taxPctType}
                        onChange={(e) => setTaxPctType(e.target.value as "%" | "fixed")}
                        title="Tax type"
                        className="bg-[#0e0e0e] border border-[#484847]/20 rounded-lg px-2 py-1 text-xs text-white outline-none"
                      >
                        <option value="%">%</option>
                        <option value="fixed">$</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={taxPctValue}
                        onChange={(e) => setTaxPctValue(Math.max(0, parseFloat(e.target.value) || 0))}
                        disabled={!taxPctEnabled}
                        title="Tax value"
                        placeholder="0"
                        className="w-20 bg-[#0e0e0e] border border-[#484847]/20 rounded-lg px-2 py-1.5 text-xs text-center outline-none focus:ring-1 focus:ring-[#c1fffe] disabled:opacity-40"
                      />
                      <span className="text-xs text-[#767575]">{taxPctType === "%" ? "%" : ""}</span>
                      <span className="text-sm font-mono w-28 text-right">{l.currency} {fmt(taxAmt)}</span>
                    </div>
                  </div>

                  {/* PayPal Fee if selected */}
                  {paymentMethod === "paypal" && (
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <span className="text-sm text-[#ff906e]">{(l as any).paypalCommission}</span>
                      <span className="text-sm font-mono font-bold text-[#ff906e]">{l.currency} {fmt(paypalFee)}</span>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="border-t border-[#484847]/20 pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-black text-[#c1fffe]">{l.totalLabel}</span>
                      <span className="text-xl font-mono font-black text-[#c1fffe]">{l.currency} {fmt(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ PAYMENT METHODS ═══ */}
            <div className="bg-[#131313] rounded-3xl border border-[#484847]/10 overflow-hidden shadow-2xl mb-6">
              <div className="px-6 py-4 border-b border-[#484847]/10">
                <span className="text-sm font-bold">{(l as any).paymentTitle}</span>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-[#0e0e0e] px-4 py-2 rounded-xl border border-[#484847]/20">
                    <input type="radio" name="payMethod" checked={paymentMethod === "none"} onChange={() => setPaymentMethod("none")} className="accent-[#c1fffe]" />
                    <span className="text-xs uppercase font-bold tracking-widest">{locale === "es" ? "Ninguno" : "None"}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-[#0e0e0e] px-4 py-2 rounded-xl border border-[#484847]/20">
                    <input type="radio" name="payMethod" checked={paymentMethod === "bank"} onChange={() => setPaymentMethod("bank")} className="accent-[#c1fffe]" />
                    <span className="text-xs uppercase font-bold tracking-widest">{(l as any).bankTransfer}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-[#0e0e0e] px-4 py-2 rounded-xl border border-[#484847]/20">
                    <input type="radio" name="payMethod" checked={paymentMethod === "paypal"} onChange={() => setPaymentMethod("paypal")} className="accent-[#c1fffe]" />
                    <span className="text-xs uppercase font-bold tracking-widest text-[#ff906e]">PayPal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-[#0e0e0e] px-4 py-2 rounded-xl border border-[#484847]/20 hover:border-[#c1fffe]/40 transition-all">
                    <input type="radio" name="payMethod" checked={paymentMethod === "both"} onChange={() => setPaymentMethod("both")} className="accent-[#c1fffe]" />
                    <span className="text-xs uppercase font-bold tracking-widest text-[#c1fffe]">{(l as any).bothMethods || "Ambos"}</span>
                  </label>
                </div>

                {(paymentMethod === "bank" || paymentMethod === "both") && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-[#767575] uppercase block mb-1">{(l as any).bankNameLabel}</label>
                        <input value={bankInfo.bankName} onChange={(e) => setBankInfo({...bankInfo, bankName: e.target.value})} className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#c1fffe]" />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#767575] uppercase block mb-1">Titular</label>
                        <input value={bankInfo.titular} onChange={(e) => setBankInfo({...bankInfo, titular: e.target.value})} className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#c1fffe]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-[#767575] uppercase block mb-1">{(l as any).accountNumLabel}</label>
                        <input value={bankInfo.accountNo} onChange={(e) => setBankInfo({...bankInfo, accountNo: e.target.value})} className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#c1fffe]" />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#767575] uppercase block mb-1">{(l as any).accountTypeLabel}</label>
                        <input value={bankInfo.accountType} onChange={(e) => setBankInfo({...bankInfo, accountType: e.target.value})} className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#c1fffe]" />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#767575] uppercase block mb-1">{(l as any).currencyLabel}</label>
                        <input value={bankInfo.currency} onChange={(e) => setBankInfo({...bankInfo, currency: e.target.value})} className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#c1fffe]" />
                      </div>
                      <div>
                        <label className="text-[10px] text-[#767575] uppercase block mb-1">{(l as any).swiftLabel}</label>
                        <input value={bankInfo.swift} onChange={(e) => setBankInfo({...bankInfo, swift: e.target.value})} className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#c1fffe]" />
                      </div>
                    </div>
                  </div>
                )}
                {(paymentMethod === "paypal" || paymentMethod === "both") && (
                  <div className="pt-2">
                    <label className="text-[10px] text-[#767575] uppercase block mb-1">Email PayPal</label>
                    <input 
                      value={paypalEmail} 
                      onChange={(e) => setPaypalEmail(e.target.value)} 
                      placeholder="ventas@techlandiard.com" 
                      className="w-full bg-[#0e0e0e] border border-[#484847]/30 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#c1fffe]" 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ═══ GLOBAL CUSTOM FIELDS ═══ */}
            <div className="bg-[#131313] rounded-3xl border border-[#484847]/10 overflow-hidden shadow-2xl mb-6">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#484847]/10">
                <span className="text-sm font-bold">{l.globalCustomField}</span>
                <button onClick={addGlobalCustomField} className="flex items-center gap-1 text-[#c1fffe] text-xs font-bold hover:underline">
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  {l.addCustomField}
                </button>
              </div>
              <div className="px-6 py-4">
                {globalCustomFields.length === 0 ? (
                  <p className="text-xs text-[#767575] text-center py-2">{l.noRecords}</p>
                ) : (
                  <div className="space-y-2">
                    {globalCustomFields.map((cf) => (
                      <div key={cf.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                        <input value={cf.label} onChange={(e) => updateGlobalCustomField(cf.id, "label", e.target.value)} placeholder={locale === "es" ? "Etiqueta" : "Label"} className={inputSm} />
                        <input value={cf.value} onChange={(e) => updateGlobalCustomField(cf.id, "value", e.target.value)} placeholder={locale === "es" ? "Valor" : "Value"} className={inputSm} />
                        <button onClick={() => removeGlobalCustomField(cf.id)} className="p-2 text-[#767575] hover:text-[#ff716c]">
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ═══ BOTTOM ACTIONS ═══ */}
            <div className="flex justify-end gap-3 pb-24 md:pb-8">
              <Link
                href={`/${locale}/admin/quotes`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#ff716c]/30 text-[#ff716c] hover:bg-[#ff716c]/10 transition-all text-sm font-bold"
              >
                <span className="material-symbols-outlined text-base">close</span>
                {l.cancelAction}
              </Link>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#c1fffe] text-[#006767] hover:shadow-[0_0_25px_rgba(0,255,255,0.3)] transition-all text-sm font-black active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base icon-filled">
                  {isSaving ? "sync" : "check_circle"}
                </span>
                {isSaving ? (locale === "es" ? "Guardando..." : "Saving...") : l.saveEstimate}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ══════════ ADD CLIENT MODAL ══════════ */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#131313] rounded-3xl border border-[#c1fffe]/20 w-full max-w-lg shadow-[0_0_50px_rgba(193,255,254,0.1)]">
            <div className="p-6 border-b border-[#484847]/10 flex justify-between items-center">
              <h3 className="text-xl font-bold font-[var(--font-headline)]">{(l as any).addNewClient}</h3>
              <button onClick={() => setShowAddClientModal(false)} className="text-[#767575] hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelSm}>{(l as any).clientName} *</label>
                  <input value={newClientData.name} onChange={(e) => setNewClientData({...newClientData, name: e.target.value})} className={inputSm} placeholder="Daniel Vargas" />
                </div>
                <div>
                  <label className={labelSm}>{(l as any).clientPhone}</label>
                  <input value={newClientData.phone} onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})} className={inputSm} placeholder="+52 ..." />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelSm}>{(l as any).clientEmail}</label>
                  <input value={newClientData.email} onChange={(e) => setNewClientData({...newClientData, email: e.target.value})} className={inputSm} placeholder="ejemplo@correo.com" />
                </div>
                <div>
                  <label className={labelSm}>{(l as any).clientCompany}</label>
                  <input value={newClientData.company} onChange={(e) => setNewClientData({...newClientData, company: e.target.value})} className={inputSm} placeholder="Empresa o Residencia" />
                </div>
              </div>
              <div>
                <label className={labelSm}>{(l as any).clientAddress}</label>
                <textarea value={newClientData.address} onChange={(e) => setNewClientData({...newClientData, address: e.target.value})} rows={2} className={inputSm + " resize-none"} placeholder="Calle, Ciudad, Estado" />
              </div>
            </div>
            <div className="p-6 border-t border-[#484847]/10 flex justify-end gap-3">
              <button onClick={() => setShowAddClientModal(false)} className="px-5 py-2.5 rounded-xl border border-[#484847]/20 text-[#767575] text-sm">{l.cancelBtn}</button>
              <button 
                onClick={handleCreateClient} 
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#c1fffe] text-[#006767] text-sm font-black hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all disabled:opacity-50"
              >
                {isSaving ? (locale === "es" ? "Guardando..." : "Saving...") : (l as any).saveClient}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ EDIT ITEM MODAL ══════════ */}
      {editModalOpen && editItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#131313] rounded-3xl border border-[#484847]/20 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-[#484847]/10">
              <h3 className="text-lg font-bold">{l.editModalTitle}</h3>
              <span className="text-sm text-[#c1fffe] font-mono">{l.editModalTotal} {l.currency} {fmt(editItem.qty * editItem.rate)}</span>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelSm}>{l.nameField} *</label>
                  <input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} className={inputSm} title="Item name" placeholder="Item name" />
                </div>
                <div>
                  <label className={labelSm}>{l.unitLabel}</label>
                  <input value={editItem.unit} onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })} className={inputSm} title="Unit" placeholder="pcs" />
                </div>
              </div>

              <div>
                <label className={labelSm}>{l.descriptionLabel}</label>
                <textarea value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} rows={3} className={inputSm + " resize-none"} title="Description" placeholder="Item description" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelSm}>{l.qtyField} *</label>
                  <input type="number" value={editItem.qty} onChange={(e) => setEditItem({ ...editItem, qty: parseFloat(e.target.value) || 0 })} className={inputSm} title="Quantity" placeholder="0" />
                </div>
                <div>
                  <label className={labelSm}>{l.rateField}</label>
                  <input type="number" value={editItem.rate} onChange={(e) => setEditItem({ ...editItem, rate: parseFloat(e.target.value) || 0 })} className={inputSm} title="Rate" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className={labelSm}>{l.hsnLabel}</label>
                <input value={editItem.hsnCode} onChange={(e) => setEditItem({ ...editItem, hsnCode: e.target.value })} className={inputSm} title="HSN/SAC code" placeholder="HSN/SAC" />
              </div>

              {/* Is service */}
              <div>
                <label className={labelSm}>{l.isService}</label>
                <div className="flex items-center gap-6 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="itemType" checked={!editItem.isService} onChange={() => setEditItem({ ...editItem, isService: false })} className="accent-[#c1fffe]" />
                    <span className="text-sm text-[#adaaaa]">{l.productType}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="itemType" checked={editItem.isService} onChange={() => setEditItem({ ...editItem, isService: true })} className="accent-[#c1fffe]" />
                    <span className="text-sm text-[#adaaaa]">{l.serviceType}</span>
                  </label>
                </div>
              </div>

              {/* Custom fields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelSm + " mb-0"}>{l.customField}</label>
                  <button onClick={addCustomFieldToEdit} className="flex items-center gap-1 text-[#c1fffe] text-[10px] font-bold hover:underline">
                    <span className="material-symbols-outlined text-xs">add_circle</span>
                    {l.addCustomField}
                  </button>
                </div>
                {editItem.customFields.length > 0 && (
                  <div className="space-y-2">
                    {editItem.customFields.map((cf) => (
                      <div key={cf.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                        <input value={cf.label} onChange={(e) => updateEditCustomField(cf.id, "label", e.target.value)} placeholder={locale === "es" ? "Etiqueta" : "Label"} className={inputSm} />
                        <input value={cf.value} onChange={(e) => updateEditCustomField(cf.id, "value", e.target.value)} placeholder={locale === "es" ? "Valor" : "Value"} className={inputSm} />
                        <button onClick={() => removeEditCustomField(cf.id)} className="p-1 text-[#767575] hover:text-[#ff716c]">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tax rates */}
              <div>
                <label className={labelSm}>{l.taxRates}</label>
                <input
                  type="number"
                  value={editItem.tax}
                  onChange={(e) => setEditItem({ ...editItem, tax: parseFloat(e.target.value) || 0 })}
                  className={inputSm}
                  min={0}
                  max={100}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-[#484847]/10">
              <button
                onClick={() => { setEditModalOpen(false); setEditItem(null); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#ff716c]/30 text-[#ff716c] hover:bg-[#ff716c]/10 text-sm font-bold transition-all"
              >
                <span className="material-symbols-outlined text-base">close</span>
                {l.cancelBtn}
              </button>
              <button
                onClick={saveEditModal}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c1fffe] text-[#006767] text-sm font-bold hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-base">save</span>
                {l.updateBtn}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ══════════ SUCCESS MODAL ══════════ */}
      {showSuccessModal && (() => {
        // ── Build share content once ──────────────────────────────────────────
        const docId = savedEstimateId ?? "";
        const viewLink = docId
          ? `${window.location.origin}/${locale}/quote/${docId}`
          : "";
        const ppFee   = +(total * 0.057).toFixed(2);
        const ppTotal = +(total + ppFee).toFixed(2);

        // Items summary (max 5, then "y X más...")
        const MAX_ITEMS = 5;
        const itemLines = items.slice(0, MAX_ITEMS).map(
          (i) => `  • ${i.name} × ${i.qty} ${i.unit || "u"} — USD ${fmt(i.qty * i.rate)}`
        );
        if (items.length > MAX_ITEMS)
          itemLines.push(`  … y ${items.length - MAX_ITEMS} ${locale === "es" ? "artículo(s) más" : "more item(s)"}`);

        // Payment method lines
        const payLines: string[] = [];
        if (paymentMethod === "bank" || paymentMethod === "both") {
          payLines.push(
            ``,
            `🏦 *${locale === "es" ? "Transferencia Bancaria" : "Bank Transfer"}:*`,
            `  Banco: ${bankInfo.bankName}`,
            `  Titular: ${bankInfo.titular}`,
            `  Cuenta: ${bankInfo.accountNo}`,
            `  SWIFT: ${bankInfo.swift}`,
            `  Moneda: ${bankInfo.currency}`,
          );
        }
        if (paymentMethod === "paypal" || paymentMethod === "both") {
          payLines.push(
            ``,
            `💳 *PayPal ${locale === "es" ? "(incluye cargo 5.7%)" : "(includes 5.7% fee)"}:*`,
            `  ${locale === "es" ? "Total a cobrar" : "Total charged"}: *USD ${fmt(ppTotal)}*`,
            `  ${locale === "es" ? "Pague desde el enlace de la cotización" : "Pay from the quote link above"}`,
          );
        }

        // Full WhatsApp message
        const waLines = [
          `Estimado/a *${selectedClient?.name ?? "Cliente"}*,`,
          ``,
          `Le comparto su cotización *${estNum}* de *Techlandiard*.`,
          ``,
          `📦 *${locale === "es" ? "Detalle" : "Items"}:*`,
          ...itemLines,
          ``,
          `💰 *${locale === "es" ? "Resumen" : "Summary"}:*`,
          `  ${locale === "es" ? "Subtotal" : "Subtotal"}: USD ${fmt(subtotal)}`,
          ...(discountAmt > 0 ? [`  ${locale === "es" ? "Descuento" : "Discount"}: -USD ${fmt(discountAmt)}`] : []),
          ...(taxAmt > 0 ? [`  ${locale === "es" ? "Impuesto" : "Tax"}: +USD ${fmt(taxAmt)}`] : []),
          `  *TOTAL: USD ${fmt(total)}*`,
          ...payLines,
          ``,
          `🔗 *${locale === "es" ? "Ver cotización completa + pagar en línea:" : "View full quote + pay online:"}*`,
          viewLink || `_(${locale === "es" ? "link disponible tras guardar" : "link available after saving"})_`,
          ``,
          `${locale === "es" ? "Quedamos a su disposición para cualquier consulta." : "We remain at your disposal for any questions."}`,
          `— ${locale === "es" ? "Equipo" : "Team"} Techlandiard`,
        ];

        // Email body
        const emailSubject = encodeURIComponent(
          `${locale === "es" ? "Cotización" : "Estimate"} ${estNum} — Techlandiard`
        );
        const emailBodyLines = [
          `${locale === "es" ? "Estimado/a" : "Dear"} ${selectedClient?.name ?? ""},`,
          ``,
          `${locale === "es"
            ? `Le enviamos su cotización ${estNum} de Techlandiard.`
            : `We are sending you estimate ${estNum} from Techlandiard.`}`,
          ``,
          `--- ${locale === "es" ? "DETALLE" : "ITEMS"} ---`,
          ...items.map((i) => `${i.name} × ${i.qty} ${i.unit || "u"}  USD ${fmt(i.qty * i.rate)}`),
          ``,
          `Subtotal: USD ${fmt(subtotal)}`,
          ...(discountAmt > 0 ? [`Descuento: -USD ${fmt(discountAmt)}`] : []),
          ...(taxAmt > 0 ? [`Impuesto: +USD ${fmt(taxAmt)}`] : []),
          `TOTAL: USD ${fmt(total)}`,
          ...(paymentMethod === "bank" || paymentMethod === "both" ? [
            ``,
            `--- ${locale === "es" ? "TRANSFERENCIA BANCARIA" : "BANK TRANSFER"} ---`,
            `Banco: ${bankInfo.bankName}`,
            `Titular: ${bankInfo.titular}`,
            `Cuenta: ${bankInfo.accountNo}`,
            `SWIFT: ${bankInfo.swift}`,
            `Moneda: ${bankInfo.currency}`,
          ] : []),
          ...(paymentMethod === "paypal" || paymentMethod === "both" ? [
            ``,
            `--- PayPal (5.7% fee) ---`,
            `Total a pagar: USD ${fmt(ppTotal)}`,
          ] : []),
          ``,
          `${locale === "es" ? "Ver cotización y pagar en línea:" : "View quote and pay online:"}`,
          viewLink,
          ``,
          `${locale === "es" ? "Saludos cordiales," : "Kind regards,"}`,
          `Techlandiard — Smart Domotics Solutions`,
        ];

        return (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            <div className="bg-[#131313] rounded-[32px] border border-[#c1fffe]/20 w-full max-w-md shadow-[0_0_80px_rgba(193,255,254,0.08)] overflow-hidden">

              {/* Header */}
              <div className="px-8 pt-8 pb-6 text-center border-b border-[#484847]/20">
                <div className="w-16 h-16 bg-[#8eff71]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl text-[#8eff71] icon-filled">check_circle</span>
                </div>
                <h2 className="text-xl font-black text-white mb-1">
                  {locale === "es" ? "¡Cotización Guardada!" : "Estimate Saved!"}
                </h2>
                <p className="text-[#adaaaa] text-xs">
                  {locale === "es"
                    ? `${estNum} · USD ${fmt(total)} · ${selectedClient?.name ?? ""}`
                    : `${estNum} · USD ${fmt(total)} · ${selectedClient?.name ?? ""}`}
                </p>
              </div>

              {/* View link */}
              {viewLink && (
                <div className="mx-6 mt-5 flex items-center gap-3 bg-[#c1fffe]/5 border border-[#c1fffe]/15 rounded-2xl px-4 py-3">
                  <span className="material-symbols-outlined text-[#c1fffe] text-base">link</span>
                  <p className="text-xs text-[#adaaaa] flex-1 truncate">{viewLink}</p>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(viewLink)}
                    className="flex-shrink-0 text-[10px] font-bold text-[#c1fffe] uppercase tracking-wider hover:underline"
                  >
                    {locale === "es" ? "Copiar" : "Copy"}
                  </button>
                </div>
              )}

              {/* Share buttons */}
              <div className="px-6 py-5 space-y-3">
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={() => {
                    const phone = selectedClient?.phone?.replace(/\D/g, "") ?? "";
                    const msg = encodeURIComponent(waLines.join("\n"));
                    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
                  }}
                  className="w-full py-3.5 rounded-2xl bg-[#25D366] text-white font-bold text-sm flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined text-lg icon-filled">chat_bubble</span>
                  WhatsApp
                  {selectedClient?.phone && (
                    <span className="ml-auto text-[10px] opacity-70 font-normal">
                      {selectedClient.phone}
                    </span>
                  )}
                </button>

                {/* Email */}
                <button
                  type="button"
                  onClick={() => {
                    const body = encodeURIComponent(emailBodyLines.join("\n"));
                    window.location.href = `mailto:${selectedClient?.email ?? ""}?subject=${emailSubject}&body=${body}`;
                  }}
                  className="w-full py-3.5 rounded-2xl bg-white/8 border border-white/15 text-white font-bold text-sm flex items-center justify-center gap-3 hover:bg-white/12 active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined text-lg">mail</span>
                  Email
                  {selectedClient?.email && (
                    <span className="ml-auto text-[10px] opacity-50 font-normal truncate max-w-[140px]">
                      {selectedClient.email}
                    </span>
                  )}
                </button>

                {/* PDF */}
                <button
                  type="button"
                  onClick={generatePDF}
                  className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-[#adaaaa] font-bold text-sm flex items-center justify-center gap-3 hover:bg-white/10 active:scale-[0.98] transition-all"
                >
                  <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                  {locale === "es" ? "Descargar PDF" : "Download PDF"}
                </button>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}/admin/quotes`)}
                  className="w-full py-3 rounded-2xl text-[#c1fffe] font-black text-xs uppercase tracking-widest hover:bg-[#c1fffe]/5 transition-colors"
                >
                  {locale === "es" ? "← Volver a Cotizaciones" : "← Back to Quotes"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
