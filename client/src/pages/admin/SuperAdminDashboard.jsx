import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaDownload } from "react-icons/fa";
import { Button } from "../../components/ui/Button.jsx";
import { superAdminApi } from "../../api/superAdminApi.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import {
  Card as AntCard,
  Table,
  Button as AntButton,
  Statistic,
  Row,
  Col,
  Tag,
  Typography,
  Skeleton,
} from "antd";
import {
  DashboardOutlined,
  ShopOutlined,
  AppstoreOutlined,
  DollarOutlined,
  RiseOutlined,
  EyeOutlined,
} from "@ant-design/icons";

export const SuperAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchReport, setBranchReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const summaryCardBodyStyle = {
    minHeight: 148,
    padding: "18px 18px 16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "8px",
    position: "relative",
    overflow: "hidden",
  };

  const compactCardBodyStyle = {
    minHeight: 116,
    padding: "16px 18px",
  };

  const tableCardBodyStyle = {
    padding: "10px 12px 12px",
  };

  const sectionCardStyle = {
    borderRadius: "18px",
    border: "1px solid rgba(226, 232, 240, 0.9)",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
    overflow: "hidden",
    background: "#ffffff",
  };

  const summaryCardStyle = {
    borderRadius: "18px",
    border: "none",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.12)",
    overflow: "hidden",
    transition: "all 0.25s ease",
  };

  const summaryCardHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "rgba(255,255,255,0.96)",
    fontWeight: 600,
    fontSize: "0.93rem",
    letterSpacing: "0.01em",
  };

  const summaryCardValueStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "2rem",
    fontWeight: 800,
    color: "white",
    lineHeight: 1.05,
    position: "relative",
    zIndex: 2,
  };

  const summaryCardSubTextStyle = {
    color: "rgba(255,255,255,0.84)",
    fontSize: "0.88rem",
    lineHeight: 1.35,
    position: "relative",
    zIndex: 2,
  };

  const watermarkIconStyle = {
    position: "absolute",
    right: "16px",
    top: "14px",
    fontSize: "3rem",
    color: "rgba(255,255,255,0.18)",
    zIndex: 1,
  };

  const statsPanelStyle = {
    ...sectionCardStyle,
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
  };

  const tableCommonProps = {
    pagination: { pageSize: 10, showSizeChanger: false },
    size: "small",
    bordered: true,
    className: "super-admin-table",
    scroll: { x: "max-content" },
    tableLayout: "fixed",
    sticky: true,
    rowClassName: (_, index) =>
      index % 2 === 0
        ? "bg-white hover:!bg-blue-50/70 transition-colors duration-200"
        : "bg-slate-50/60 hover:!bg-blue-50/70 transition-colors duration-200",
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await superAdminApi.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
      const message =
        error.code === "ECONNABORTED"
          ? "Request timed out. Please ensure the backend server is running and try again."
          : error.response?.data?.message || "Failed to load dashboard";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchReport = async (shopId) => {
    try {
      setReportLoading(true);
      const response = await superAdminApi.getBranchReport(shopId);
      setBranchReport(response.data.data);
      setSelectedBranch(shopId);
      setActiveTab(3);
    } catch (error) {
      console.error("Failed to fetch branch report:", error);
      toast.error(error.response?.data?.message || "Failed to load branch report");
    } finally {
      setReportLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!dashboardData) return;

    let csvContent = "Branch Analytics Report\n";
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;

    csvContent += "SUMMARY\n";
    csvContent += `Total Branches,${dashboardData.summary.totalBranches}\n`;
    csvContent += `Total Products,${dashboardData.summary.totalProducts}\n`;
    csvContent += `Total Revenue,${dashboardData.summary.totalRevenue}\n`;
    csvContent += `Expected Revenue,${dashboardData.summary.totalExpectedRevenue}\n`;
    csvContent += `Total Staff,${dashboardData.summary.totalStaff}\n\n`;

    csvContent += "BRANCH-WISE ANALYTICS\n";
    csvContent +=
      "Branch Name,Location,Owner,Stock Value,Actual Revenue,Expected Revenue,Transactions,Staff Count\n";
    dashboardData.branchAnalytics.forEach((branch) => {
      csvContent += `${branch.shopName},${branch.location},${branch.ownerName},${branch.totalStockValue},${branch.actualRevenue},${branch.expectedRevenue},${branch.totalTransactions},${branch.staffCount}\n`;
    });

    csvContent += "\n\nPRODUCT DISTRIBUTION\n";
    csvContent += "Product Name,Category,Total Quantity,Branches Stocking,Revenue\n";
    dashboardData.productDistribution.forEach((product) => {
      csvContent += `${product.productName},${product.category},${product.totalQuantity},${product.branchesStocking},${product.totalRevenue}\n`;
    });

    const link = document.createElement("a");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    link.href = URL.createObjectURL(blob);
    link.download = `branch-analytics-${new Date().getTime()}.csv`;
    link.click();

    toast.success("Report exported successfully!");
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-4 mb-4 space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Super Admin Dashboard
          </Typography.Title>
          <Typography.Text type="secondary">
            Complete overview of all branches and operations
          </Typography.Text>
        </div>

        <Row gutter={[12, 12]}>
          {[...Array(4)].map((_, i) => (
            <Col xs={24} sm={12} md={6} key={i}>
              <AntCard style={sectionCardStyle}>
                <Skeleton active paragraph={{ rows: 3 }} />
              </AntCard>
            </Col>
          ))}
          <Col xs={24}>
            <AntCard style={sectionCardStyle}>
              <Skeleton active paragraph={{ rows: 8 }} />
            </AntCard>
          </Col>
        </Row>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="max-w-6xl mx-auto mt-4 mb-4">
        <AntCard style={sectionCardStyle}>
          <Typography.Title level={4} type="danger" style={{ marginBottom: 8 }}>
            Failed to load dashboard data
          </Typography.Title>
          <Typography.Text type="secondary">
            Dashboard metrics could not be fetched right now.
          </Typography.Text>
          <div>
            <AntButton onClick={fetchDashboard} type="primary" style={{ marginTop: "16px" }}>
              Retry
            </AntButton>
          </div>
        </AntCard>
      </div>
    );
  }

  const { summary, branchAnalytics, productDistribution } = dashboardData;

  const overviewCards = [
    {
      key: "branches",
      title: "Total Branches",
      value: summary.totalBranches,
      subText: "Active locations",
      icon: <ShopOutlined style={watermarkIconStyle} />,
      headerIcon: <ShopOutlined style={{ color: "white", opacity: 0.88 }} />,
      style: {
        ...summaryCardStyle,
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
      },
    },
    {
      key: "products",
      title: "Total Products",
      value: summary.totalProducts,
      subText: `${summary.totalProductsStocked} stocked`,
      icon: <AppstoreOutlined style={watermarkIconStyle} />,
      headerIcon: <AppstoreOutlined style={{ color: "white", opacity: 0.88 }} />,
      style: {
        ...summaryCardStyle,
        background: "linear-gradient(135deg, #db2777 0%, #f97316 100%)",
      },
    },
    {
      key: "revenue",
      title: "Total Revenue",
      value: formatCurrency(summary.totalRevenue),
      subText: "This month",
      icon: <DollarOutlined style={watermarkIconStyle} />,
      headerIcon: <DollarOutlined style={{ color: "white", opacity: 0.88 }} />,
      style: {
        ...summaryCardStyle,
        background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
      },
    },
    {
      key: "expected",
      title: "Expected Revenue",
      value: formatCurrency(summary.totalExpectedRevenue),
      subText: "Based on inventory",
      icon: <RiseOutlined style={watermarkIconStyle} />,
      headerIcon: <RiseOutlined style={{ color: "white", opacity: 0.88 }} />,
      style: {
        ...summaryCardStyle,
        background: "linear-gradient(135deg, #16a34a 0%, #2dd4bf 100%)",
      },
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200/90 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <DashboardOutlined style={{ color: "#2563eb", fontSize: "18px" }} />
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Super Admin Dashboard
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Complete overview of all branches and operations
            </p>
          </div>

          <Button
            onClick={exportToCSV}
            variant="secondary"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
          >
            <FaDownload /> Export Report
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 0, label: "Overview" },
            { id: 1, label: "Branch Analytics" },
            { id: 2, label: "Product Distribution" },
            { id: 3, label: "Branch Details", hidden: !selectedBranch },
          ].map(
            (tab) =>
              !tab.hidden && (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              )
          )}
        </div>
      </div>

      {activeTab === 0 && (
        <div className="space-y-4">
          <Row gutter={[12, 12]}>
            {overviewCards.map((card) => (
              <Col xs={24} sm={12} md={6} key={card.key}>
                <AntCard bodyStyle={summaryCardBodyStyle} style={card.style} hoverable>
                  {card.icon}
                  <div style={summaryCardHeaderStyle}>
                    {card.headerIcon}
                    <span>{card.title}</span>
                  </div>
                  <div style={summaryCardValueStyle}>
                    <span>{card.value}</span>
                  </div>
                  <div style={summaryCardSubTextStyle}>{card.subText}</div>
                </AntCard>
              </Col>
            ))}
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={8}>
              <AntCard bodyStyle={compactCardBodyStyle} style={statsPanelStyle} hoverable>
                <Statistic
                  title={<span style={{ color: "#64748b", fontWeight: 500 }}>Total Transactions</span>}
                  value={summary.totalSalesTransactions}
                  styles={{ content: { color: "#2563eb", fontSize: "1.7rem", fontWeight: "800" } }}
                  suffix={
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600 }}>
                      Sales completed
                    </span>
                  }
                />
              </AntCard>
            </Col>

            <Col xs={24} sm={8}>
              <AntCard bodyStyle={compactCardBodyStyle} style={statsPanelStyle} hoverable>
                <Statistic
                  title={<span style={{ color: "#64748b", fontWeight: 500 }}>Total Staff</span>}
                  value={summary.totalStaff}
                  styles={{ content: { color: "#16a34a", fontSize: "1.7rem", fontWeight: "800" } }}
                  suffix={
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600 }}>
                      Across all branches
                    </span>
                  }
                />
              </AntCard>
            </Col>

            <Col xs={24} sm={8}>
              <AntCard bodyStyle={compactCardBodyStyle} style={statsPanelStyle} hoverable>
                <Statistic
                  title={<span style={{ color: "#64748b", fontWeight: 500 }}>Total Returns</span>}
                  value={summary.totalReturns}
                  styles={{ content: { color: "#ea580c", fontSize: "1.7rem", fontWeight: "800" } }}
                  suffix={
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: 600 }}>
                      Items returned
                    </span>
                  }
                />
              </AntCard>
            </Col>
          </Row>

          <AntCard
            title={
              <span style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                <DashboardOutlined style={{ marginRight: "8px", color: "#2563eb" }} />
                Top 5 Performing Branches
              </span>
            }
            style={sectionCardStyle}
            bodyStyle={tableCardBodyStyle}
          >
            <Table
              {...tableCommonProps}
              columns={[
                {
                  title: "Branch Name",
                  dataIndex: "shopName",
                  key: "shopName",
                  width: "25%",
                  render: (value) => (
                    <span style={{ fontWeight: "600", color: "#1e293b" }}>{value}</span>
                  ),
                },
                {
                  title: "Revenue",
                  dataIndex: "actualRevenue",
                  key: "actualRevenue",
                  align: "right",
                  width: "18%",
                  render: (value) => (
                    <span style={{ color: "#16a34a", fontWeight: "700" }}>
                      {formatCurrency(value)}
                    </span>
                  ),
                },
                {
                  title: "Expected Revenue",
                  dataIndex: "expectedRevenue",
                  key: "expectedRevenue",
                  align: "right",
                  width: "18%",
                  render: (value) => (
                    <span style={{ color: "#2563eb", fontWeight: 600 }}>
                      {formatCurrency(value)}
                    </span>
                  ),
                },
                {
                  title: "Transactions",
                  dataIndex: "totalTransactions",
                  key: "totalTransactions",
                  align: "center",
                  width: "14%",
                  render: (value) => <span style={{ fontWeight: "600" }}>{value}</span>,
                },
                {
                  title: "Gap",
                  dataIndex: "gap",
                  key: "gap",
                  align: "right",
                  width: "25%",
                  render: (value, record) => {
                    const gap = record.expectedRevenue - record.actualRevenue;
                    return (
                      <Tag
                        color={gap > 0 ? "orange" : "green"}
                        style={{
                          fontSize: "12px",
                          padding: "4px 8px",
                          borderRadius: "999px",
                          fontWeight: 600,
                        }}
                      >
                        {gap > 0 ? "↑" : "↓"} {formatCurrency(Math.abs(gap))}
                      </Tag>
                    );
                  },
                },
              ]}
              dataSource={summary.topBranches.map((branch, idx) => ({ ...branch, key: idx }))}
              pagination={false}
              size="small"
              bordered
            />
          </AntCard>
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-4">
          <AntCard
            title={
              <span style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                All Branches Analytics
              </span>
            }
            style={sectionCardStyle}
            bodyStyle={tableCardBodyStyle}
          >
            <Table
              {...tableCommonProps}
              columns={[
                {
                  title: "Branch",
                  dataIndex: "shopName",
                  key: "shopName",
                  render: (value) => (
                    <span style={{ fontWeight: "600", color: "#1e293b" }}>{value}</span>
                  ),
                },
                {
                  title: "Location",
                  dataIndex: "location",
                  key: "location",
                  render: (value) => <span style={{ color: "#475569" }}>{value}</span>,
                },
                {
                  title: "Products",
                  dataIndex: "productsCount",
                  key: "productsCount",
                  align: "center",
                  render: (value) => <span style={{ fontWeight: "600" }}>{value}</span>,
                },
                {
                  title: "Stock",
                  dataIndex: "totalStockValue",
                  key: "totalStockValue",
                  align: "right",
                  render: (value) => (
                    <span style={{ color: "#2563eb", fontWeight: 600 }}>
                      {formatCurrency(value)}
                    </span>
                  ),
                },
                {
                  title: "Revenue",
                  dataIndex: "actualRevenue",
                  key: "actualRevenue",
                  align: "right",
                  render: (value) => (
                    <span style={{ color: "#16a34a", fontWeight: "700", fontSize: "13px" }}>
                      {formatCurrency(value)}
                    </span>
                  ),
                },
                {
                  title: "Expected",
                  dataIndex: "expectedRevenue",
                  key: "expectedRevenue",
                  align: "right",
                  render: (value) => (
                    <span style={{ color: "#d97706", fontWeight: 600 }}>
                      {formatCurrency(value)}
                    </span>
                  ),
                },
                {
                  title: "Gap",
                  dataIndex: "gap",
                  key: "gap",
                  align: "center",
                  render: (value, record) => {
                    const revenueDiff = record.expectedRevenue - record.actualRevenue;
                    const isUnderPerforming = revenueDiff > 0;
                    return (
                      <Tag
                        color={isUnderPerforming ? "orange" : "green"}
                        style={{ fontSize: "12px", borderRadius: "999px", fontWeight: 600 }}
                      >
                        {isUnderPerforming ? "↑" : "↓"} {formatCurrency(Math.abs(revenueDiff))}
                      </Tag>
                    );
                  },
                },
                {
                  title: "Staff",
                  dataIndex: "staffCount",
                  key: "staffCount",
                  align: "center",
                  render: (value) => <span style={{ fontWeight: "600" }}>{value}</span>,
                },
                {
                  title: "Actions",
                  key: "actions",
                  align: "center",
                  width: "10%",
                  render: (value, record) => (
                    <AntButton
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => fetchBranchReport(record.shopId)}
                      loading={reportLoading}
                      style={{ color: "#2563eb", fontWeight: 600 }}
                    >
                      View
                    </AntButton>
                  ),
                },
              ]}
              dataSource={branchAnalytics.map((branch, idx) => ({ ...branch, key: idx }))}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              size="small"
              bordered
            />
          </AntCard>
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-4">
          <AntCard
            title={
              <span style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                Product Distribution Across Branches
              </span>
            }
            style={sectionCardStyle}
            bodyStyle={tableCardBodyStyle}
          >
            <Table
              {...tableCommonProps}
              columns={[
                {
                  title: "Product",
                  dataIndex: "productName",
                  key: "productName",
                  render: (value) => (
                    <span style={{ fontWeight: "600", color: "#1e293b" }}>{value}</span>
                  ),
                },
                {
                  title: "Category",
                  dataIndex: "category",
                  key: "category",
                  render: (value) => <span style={{ color: "#64748b" }}>{value}</span>,
                },
                {
                  title: "Total Qty",
                  dataIndex: "totalQuantity",
                  key: "totalQuantity",
                  align: "center",
                  render: (value) => <span style={{ fontWeight: "600" }}>{value}</span>,
                },
                {
                  title: "Branches",
                  dataIndex: "branchesStocking",
                  key: "branchesStocking",
                  align: "center",
                  render: (value) => (
                    <Tag
                      color="cyan"
                      style={{ fontSize: "12px", borderRadius: "999px", fontWeight: 600 }}
                    >
                      {value} branches
                    </Tag>
                  ),
                },
                {
                  title: "Price",
                  dataIndex: "price",
                  key: "price",
                  align: "right",
                  render: (value) => (
                    <span style={{ color: "#d97706", fontWeight: 600 }}>
                      {formatCurrency(value)}
                    </span>
                  ),
                },
                {
                  title: "Revenue",
                  dataIndex: "totalRevenue",
                  key: "totalRevenue",
                  align: "right",
                  render: (value) => (
                    <span style={{ color: "#16a34a", fontWeight: "700", fontSize: "13px" }}>
                      {formatCurrency(value)}
                    </span>
                  ),
                },
              ]}
              dataSource={productDistribution.map((product, idx) => ({ ...product, key: idx }))}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              size="small"
              bordered
            />
          </AntCard>
        </div>
      )}

      {activeTab === 3 && branchReport && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white px-5 py-4 shadow-sm">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  {branchReport.branch.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{branchReport.branch.location}</p>
              </div>
              <AntButton
                onClick={() => setActiveTab(1)}
                style={{ marginTop: "2px", borderRadius: "10px" }}
              >
                Back
              </AntButton>
            </div>
          </div>

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={12} md={6}>
              <AntCard
                bodyStyle={compactCardBodyStyle}
                style={{
                  ...summaryCardStyle,
                  background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
                }}
                hoverable
              >
                <Statistic
                  title={<span style={{ color: "#1d4ed8", fontWeight: "600" }}>Total Revenue</span>}
                  value={formatCurrency(branchReport.totalRevenue)}
                  styles={{ content: { color: "#1e40af", fontSize: "1.5rem", fontWeight: "800" } }}
                />
              </AntCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <AntCard
                bodyStyle={compactCardBodyStyle}
                style={{
                  ...summaryCardStyle,
                  background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
                }}
                hoverable
              >
                <Statistic
                  title={
                    <span style={{ color: "#15803d", fontWeight: "600" }}>Expected Revenue</span>
                  }
                  value={formatCurrency(branchReport.expectedRevenue)}
                  styles={{ content: { color: "#166534", fontSize: "1.5rem", fontWeight: "800" } }}
                />
              </AntCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <AntCard
                bodyStyle={compactCardBodyStyle}
                style={{
                  ...summaryCardStyle,
                  background: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)",
                }}
                hoverable
              >
                <Statistic
                  title={<span style={{ color: "#c2410c", fontWeight: "600" }}>Gap</span>}
                  value={formatCurrency(branchReport.revenueDifference)}
                  styles={{ content: { color: "#9a3412", fontSize: "1.5rem", fontWeight: "800" } }}
                />
              </AntCard>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <AntCard
                bodyStyle={compactCardBodyStyle}
                style={{
                  ...summaryCardStyle,
                  background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)",
                }}
                hoverable
              >
                <Statistic
                  title={<span style={{ color: "#7c3aed", fontWeight: "600" }}>Transactions</span>}
                  value={branchReport.salesCount}
                  styles={{ content: { color: "#6d28d9", fontSize: "1.5rem", fontWeight: "800" } }}
                />
              </AntCard>
            </Col>
          </Row>

          <AntCard
            title={
              <span style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                Current Inventory
              </span>
            }
            style={sectionCardStyle}
            bodyStyle={tableCardBodyStyle}
          >
            <Table
              {...tableCommonProps}
              columns={[
                {
                  title: "Product",
                  dataIndex: ["productId", "name"],
                  key: "product",
                  render: (value) => (
                    <span style={{ fontWeight: "600", color: "#1e293b" }}>{value}</span>
                  ),
                },
                {
                  title: "Quantity",
                  dataIndex: "quantity",
                  key: "quantity",
                  align: "center",
                  render: (value) => <span style={{ fontWeight: "600" }}>{value}</span>,
                },
                {
                  title: "Unit Price",
                  dataIndex: ["productId", "price"],
                  key: "price",
                  align: "right",
                  render: (value) => (
                    <span style={{ color: "#d97706", fontWeight: 600 }}>
                      {formatCurrency(value || 0)}
                    </span>
                  ),
                },
                {
                  title: "Total Value",
                  key: "totalValue",
                  align: "right",
                  render: (value, record) => (
                    <span style={{ color: "#16a34a", fontWeight: "700", fontSize: "13px" }}>
                      {formatCurrency((record.productId?.price || 0) * record.quantity)}
                    </span>
                  ),
                },
              ]}
              dataSource={branchReport.inventory?.map((inv, idx) => ({ ...inv, key: idx }))}
              pagination={false}
              size="small"
              bordered
            />
          </AntCard>
        </div>
      )}
    </div>
  );
};
