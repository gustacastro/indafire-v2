import { Document, Page, View, Text, Image, StyleSheet, Svg, Path, Rect } from '@react-pdf/renderer';
import { QuotePdfData } from './quote-pdf.types';

const BRAND = '#dc2626';
const PRIMARY = '#2563eb';
const HEADING = '#0f172a';
const FOREGROUND = '#1e293b';
const MUTED = '#64748b';
const BORDER = '#e2e8f0';
const BG_ALT = '#f8fafc';
const WHITE = '#ffffff';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: FOREGROUND,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    backgroundColor: WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: BRAND,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: HEADING,
    letterSpacing: -0.5,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  quoteCode: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: HEADING,
  },
  headerDate: {
    fontSize: 9,
    color: MUTED,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: HEADING,
    marginBottom: 12,
  },
  greeting: {
    fontSize: 10,
    color: MUTED,
    lineHeight: 1.6,
    maxWidth: 420,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  infoCard: {
    flex: 1,
    backgroundColor: BG_ALT,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  infoLabel: {
    fontSize: 8,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: HEADING,
  },
  infoSubValue: {
    fontSize: 8,
    color: MUTED,
    marginTop: 2,
  },
  infoFieldLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: FOREGROUND,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: HEADING,
    marginBottom: 10,
    marginTop: 4,
  },
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: HEADING,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowAlt: {
    backgroundColor: BG_ALT,
  },
  tableCell: {
    fontSize: 9,
    color: FOREGROUND,
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: HEADING,
  },
  tableCellMuted: {
    fontSize: 8,
    color: MUTED,
    marginTop: 1,
  },
  colName: { width: '35%' },
  colDesc: { width: '25%' },
  colQty: { width: '10%', textAlign: 'center' },
  colUnit: { width: '15%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right' },
  summaryContainer: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  summaryBox: {
    width: 260,
    backgroundColor: BG_ALT,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 9,
    color: MUTED,
  },
  summaryValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: FOREGROUND,
  },
  summaryDivider: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginVertical: 4,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    marginTop: 2,
  },
  summaryTotalLabel: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: HEADING,
  },
  summaryTotalValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: PRIMARY,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: MUTED,
  },
});

function formatCurrency(cents: number): string {
  if (!cents && cents !== 0) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function LogoSvg() {
  return (
    <Svg width="20" height="20" viewBox="0 0 150 150">
      <Rect x="0" y="0" width="150" height="150" rx="0" ry="0" fill="none" />
      <Path
        d="M93 38 C93.99 38 94.98 38 96 38 C105.63 57.32 110.21 76.78 104 98 C99.7 109.25 92.87 116.22 82.7 122.4 C74.47 127.41 70.4 134.13 67 143 C60.11 141.06 53.83 134.89 50 129 C46.2 119.69 47.18 109.15 51 100 C54.35 92.74 59.98 88.08 66 83 C80.32 70.88 90.15 56.96 93 38Z"
        fill={WHITE}
      />
      <Path
        d="M85 1 C87 2 87 2 87.63 3.69 C91.83 23.41 88.3 42.8 78 60 C71.2 70.33 61.45 80.93 50 86 C47.75 85.83 47.75 85.83 46 85 C42.08 76.96 42.36 67.36 45 59 C48.97 49.24 54.29 43.46 62.49 37.09 C66.54 33.71 70.62 29.77 73 25 C73.66 25 74.32 25 75 25 C75.12 24.43 75.23 23.85 75.35 23.26 C76.05 20.82 77.06 19.04 78.38 16.88 C80.77 12.7 82.19 8.61 83.42 3.97 C84 2 84 2 85 1Z"
        fill={WHITE}
      />
      <Path
        d="M98 121 C98 130.57 98 140.14 98 150 C90.08 150 82.16 150 74 150 C75.3 139.59 78.74 132.59 87 126 C94.71 121 94.71 121 98 121Z"
        fill={WHITE}
      />
    </Svg>
  );
}

export function QuotePdfTemplate({ data }: { data: QuotePdfData }) {
  const today = new Date();
  const generatedDate = formatDate(today);
  const validityDate = formatDate(addDays(today, 7));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoContainer}>
              <LogoSvg />
            </View>
            <Text style={styles.logoText}>IndaFire</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.quoteCode}>#{data.quoteCode}</Text>
            <Text style={styles.headerDate}>{generatedDate}</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Orçamento para {data.clientName}</Text>
          <Text style={styles.greeting}>
            Olá {data.clientName},{'\n'}
            Obrigado pela oportunidade. Abaixo está um resumo do seu orçamento. Avise-nos se quiser alguma alteração.
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Criado por</Text>
            <Text style={styles.infoValue}>{data.creatorName}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Validade</Text>
            <Text style={styles.infoValue}>{validityDate}</Text>
          </View>
          {data.paymentMethod && (
            <View style={[styles.infoCard, { flex: 2 }]}>
              <Text style={styles.infoLabel}>Método de Pagamento</Text>
              <Text style={styles.infoValue}>{data.paymentMethod.name}</Text>
              {data.paymentMethod.provider ? (
                <Text style={styles.infoSubValue}>
                  <Text style={styles.infoFieldLabel}>Provedor: </Text>
                  {data.paymentMethod.provider}
                </Text>
              ) : null}
              {data.paymentMethod.allowInstallments && data.installments > 0 ? (
                <Text style={styles.infoSubValue}>
                  <Text style={styles.infoFieldLabel}>Parcelas: </Text>
                  {data.installments}x
                </Text>
              ) : (
                <Text style={styles.infoSubValue}>
                  <Text style={styles.infoFieldLabel}>Condição: </Text>
                  À vista
                </Text>
              )}
              {data.paymentMethod.methodInfo ? (
                <Text style={styles.infoSubValue}>
                  <Text style={styles.infoFieldLabel}>Informações: </Text>
                  {data.paymentMethod.methodInfo}
                </Text>
              ) : null}
            </View>
          )}
        </View>

        {data.products.length > 0 && (
          <View style={styles.table}>
            <Text style={styles.sectionTitle}>Produtos</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colName]}>Produto</Text>
              <Text style={[styles.tableHeaderText, styles.colDesc]}>Descrição</Text>
              <Text style={[styles.tableHeaderText, styles.colQty]}>Qtd</Text>
              <Text style={[styles.tableHeaderText, styles.colUnit]}>Valor Unit.</Text>
              <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
            </View>
            {data.products.map((product, index) => (
              <View
                key={`product-${index}`}
                style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <View style={styles.colName}>
                  <Text style={styles.tableCellBold}>{product.name}</Text>
                </View>
                <View style={styles.colDesc}>
                  <Text style={styles.tableCell}>
                    {product.description ? (product.description.length > 60 ? `${product.description.substring(0, 60)}...` : product.description) : '—'}
                  </Text>
                </View>
                <Text style={[styles.tableCell, styles.colQty]}>{product.amount}</Text>
                <Text style={[styles.tableCellBold, styles.colUnit]}>{formatCurrency(product.unitaryValue)}</Text>
                <Text style={[styles.tableCellBold, styles.colTotal]}>{formatCurrency(product.totalValue)}</Text>
              </View>
            ))}
          </View>
        )}

        {data.jobs.length > 0 && (
          <View style={styles.table}>
            <Text style={styles.sectionTitle}>Serviços</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colName]}>Serviço</Text>
              <Text style={[styles.tableHeaderText, styles.colDesc]}>Descrição</Text>
              <Text style={[styles.tableHeaderText, styles.colQty]}>Qtd</Text>
              <Text style={[styles.tableHeaderText, styles.colUnit]}>Valor Unit.</Text>
              <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
            </View>
            {data.jobs.map((job, index) => (
              <View
                key={`job-${index}`}
                style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <View style={styles.colName}>
                  <Text style={styles.tableCellBold}>{job.name}</Text>
                </View>
                <View style={styles.colDesc}>
                  <Text style={styles.tableCell}>
                    {job.description ? (job.description.length > 60 ? `${job.description.substring(0, 60)}...` : job.description) : '—'}
                  </Text>
                </View>
                <Text style={[styles.tableCell, styles.colQty]}>{job.amount}</Text>
                <Text style={[styles.tableCellBold, styles.colUnit]}>{formatCurrency(job.unitaryValue)}</Text>
                <Text style={[styles.tableCellBold, styles.colTotal]}>{formatCurrency(job.totalValue)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal dos itens</Text>
              <Text style={styles.summaryValue}>{formatCurrency(data.totalItemsValue)}</Text>
            </View>
            {data.freight > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frete</Text>
                <Text style={styles.summaryValue}>{formatCurrency(data.freight)}</Text>
              </View>
            )}
            {data.discountValue > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Desconto ({(data.discountPercentage / 100).toFixed(2).replace('.', ',')}%)
                </Text>
                <Text style={[styles.summaryValue, { color: BRAND }]}>
                  - {formatCurrency(data.discountValue)}
                </Text>
              </View>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryTotalRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{formatCurrency(data.netValue)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>IndaFire · Orçamento #{data.quoteCode}</Text>
          <Text style={styles.footerText}>Gerado em {generatedDate}</Text>
        </View>
      </Page>
    </Document>
  );
}
