import React, { useState, useEffect } from "react";
import filterIcon from "../../assets/icons/filter.svg";
import sortIcon from "../../assets/icons/sort.svg";
import Datepicker from "react-tailwindcss-datepicker";
import Paginate from "react-paginate";

function TableNotifications({ notifications }) {
  const [filters, setFilters] = useState({
    numExp: "",
    numReg: "",
    serExp: "",
    descOficio: "",
    numOficio: "",
    fechaGaceta: {
      startDate: null,
      endDate: null,
    },
    fechaOficio: {
      startDate: null,
      endDate: null,
    },
  });

  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [paginatedNotifications, setPaginatedNotifications] = useState([]);

  const [filteredNotifications, setFilteredNotifications] = useState([]);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  useEffect(() => {
    setFilteredNotifications(
      notifications
        .filter((notification) => {
          const startDateGaceta = filters.fechaGaceta.startDate;
          const endDateGaceta = filters.fechaGaceta.endDate;
          const startDateOficio = filters.fechaOficio.startDate;
          const endDateOficio = filters.fechaOficio.endDate;
          const notificationDateGaceta = new Date(notification.fechaGaceta);
          const notificationDateOficio = new Date(notification.fechaOficio);
          return (
            notification.numExp
              .toLowerCase()
              .includes(filters.numExp.toLowerCase()) &&
            notification.numReg
              .toLowerCase()
              .includes(filters.numReg.toLowerCase()) &&
            notification.serExp
              .toLowerCase()
              .includes(filters.serExp.toLowerCase()) &&
            notification.descOficio
              .toLowerCase()
              .includes(filters.descOficio.toLowerCase()) &&
            notification.numOficio
              .toLowerCase()
              .includes(filters.numOficio.toLowerCase()) &&
            (startDateGaceta === null ||
              endDateGaceta === null ||
              (new Date(
                notificationDateGaceta.getFullYear(),
                notificationDateGaceta.getMonth(),
                notificationDateGaceta.getDate()
              ) >=
                new Date(
                  startDateGaceta.getFullYear(),
                  startDateGaceta.getMonth(),
                  startDateGaceta.getDate()
                ) &&
                new Date(
                  notificationDateGaceta.getFullYear(),
                  notificationDateGaceta.getMonth(),
                  notificationDateGaceta.getDate() + 1
                ) -
                  1 <=
                  new Date(
                    endDateGaceta.getFullYear(),
                    endDateGaceta.getMonth(),
                    endDateGaceta.getDate() + 1
                  ) -
                    1)) &&
            (startDateOficio === null ||
              endDateOficio === null ||
              (new Date(
                notificationDateOficio.getFullYear(),
                notificationDateOficio.getMonth(),
                notificationDateOficio.getDate()
              ) >=
                new Date(
                  startDateOficio.getFullYear(),
                  startDateOficio.getMonth(),
                  startDateOficio.getDate()
                ) &&
                new Date(
                  notificationDateOficio.getFullYear(),
                  notificationDateOficio.getMonth(),
                  notificationDateOficio.getDate() + 1
                ) -
                  1 <=
                  new Date(
                    endDateOficio.getFullYear(),
                    endDateOficio.getMonth(),
                    endDateOficio.getDate() + 1
                  ) -
                    1))
          );
        })
        .sort((a, b) => {
          if (sortConfig.key === null) {
            return 0;
          }
          const colA = a[sortConfig.key];
          const colB = b[sortConfig.key];
          if (sortConfig.direction === "ascending") {
            return colA > colB ? 1 : -1;
          } else {
            return colA < colB ? 1 : -1;
          }
        })
    );


  }, [notifications, filters, sortConfig]);
  
  useEffect(() => {
    setTotalPages(Math.ceil(filteredNotifications.length / rowsPerPage));
    setTotalItems(filteredNotifications.length);
    setPaginatedNotifications(
      filteredNotifications.slice(
        currentPage * rowsPerPage,
        (currentPage + 1) * rowsPerPage
      )
    );
  }, [filteredNotifications, rowsPerPage, currentPage]);
    

  

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({
      key,
      direction,
    });
  };


  return (
    <>
      <section className="flex flex-col w-full">
        <div className="flex w-full justify-end">
          <button
            className="flex items-center justify-center p-2 gap-2 rounded-md text-center font-bold"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
            <img className="w-5 h-5" src={filterIcon} alt="Filter icon" />
          </button>
        </div>

        <div
          className={`${
            showFilters
              ? "max-h-[1000px] transition-height opacity-100"
              : "max-h-0 opacity-0 -z-10"
          } flex flex-wrap max-sm:flex-col gap-2 mb-4 transition-all transition-height duration-500 ease-in-out justify-center items-center`}
        >
          <div className="flex flex-col gap-1 max-sm:w-full">
            <label className="italic text-xs" htmlFor="Num Exp">Num Exp</label>
            <input
              type="text"
              name="numExp"
              value={filters.numExp}
              onChange={handleFilterChange}
              className="p-2 rounded-md"
              placeholder="Num. Exp."
            />
          </div>
          <div  className="flex flex-col gap-1 max-sm:w-full">
            <label className="italic text-xs" htmlFor="Num Reg">Num Reg</label>
          <input
            type="text"
            name="numReg"
            value={filters.numReg}
            onChange={handleFilterChange}
            className="p-2 rounded-md"
            placeholder="Num. Reg."
          />
          </div>
          <div  className="flex flex-col gap-1 max-sm:w-full">
            <label className="italic text-xs" htmlFor="Ser Exp">Ser Exp</label>
          <input
            type="text"
            name="serExp"
            value={filters.serExp}
            onChange={handleFilterChange}
            className="p-2 rounded-md"
            placeholder="Serie Exp."
          />
          </div>
          <div  className="flex flex-col gap-1 max-sm:w-full">
            <label className="italic text-xs" htmlFor="Desc Oficio">Desc Oficio</label>
          <input
            type="text"
            name="descOficio"
            value={filters.descOficio}
            onChange={handleFilterChange}
            className="p-2 rounded-md"
            placeholder="Desc. Oficio"
          />
          </div>
          <div  className="flex flex-col gap-1 max-sm:w-full">
            <label className="italic text-xs" htmlFor="Num Oficio">Num Oficio</label>
          <input
            type="text"
            name="numOficio"
            value={filters.numOficio}
            onChange={handleFilterChange}
            className="p-2 rounded-md"
            placeholder="Num. Oficio"
          />
          </div>
          <div className="flex flex-col gap-1 max-sm:w-full">
          <label className="italic text-xs" htmlFor="Fecha Gaceta">Fecha Gaceta</label>
            <Datepicker
            primaryColor="sky"
              value={filters.fechaGaceta}
              onChange={(newValue) =>
                setFilters({
                  ...filters,
                  fechaGaceta: newValue,
                })
              }
            />
          </div>
          <div className="flex flex-col gap-1 max-sm:w-full">
          <label className="italic text-xs" htmlFor="Fecha Oficio">Fecha Oficio</label>
            <Datepicker
            primaryColor="sky"
              value={filters.fechaOficio}
              onChange={(newValue) =>
                setFilters({
                  ...filters,
                  fechaOficio: newValue,
                })
              }
            />
          </div>
        </div>
        <table className="table-auto w-full table-border-none">
          <thead className="text-center gap-1 bg-list-header rounded-3xl sticky top-1">
            <tr>
              <th
                className="text-center gap-1 cursor-pointer "
                onClick={() => handleSort("numExp")}
              >
                <div className="flex items-center justify-center gap-1 w-full">
                  <span className="w-fit">Num. Exp.</span>
                  <img className="w-3 h-3" src={sortIcon} alt="Sort icon" />
                </div>
              </th>
              <th
                className="text-center gap-1 cursor-pointer  max-md:hidden"
                onClick={() => handleSort("numReg")}
              >
                <div className="flex items-center justify-center gap-1 w-full">
                  <span className="w-fit">Num. Reg.</span>
                  <img className="w-3 h-3" src={sortIcon} alt="Sort icon" />
                </div>
              </th>
              <th
                className="text-center gap-1 cursor-pointer  max-md:hidden"
                onClick={() => handleSort("serExp")}
              >
                <div className="flex items-center justify-center gap-1 w-full">
                  <span className="w-fit">Serie Exp.</span>
                  <img className="w-3 h-3" src={sortIcon} alt="Sort icon" />
                </div>
              </th>
              <th
                className="text-center gap-1 cursor-pointer "
                onClick={() => handleSort("descOficio")}
              >
                <div className="flex items-center justify-center gap-1 w-full">
                  <span className="w-fit">Desc. Oficio</span>
                  <img className="w-3 h-3" src={sortIcon} alt="Sort icon" />
                </div>
              </th>
              <th
                className="text-center gap-1 cursor-pointer max-md:hidden"
                onClick={() => handleSort("numOficio")}
              >
                <div className="flex items-center justify-center gap-1 w-full ">
                  <span className="w-fit">Num. Oficio</span>
                  <img className="w-3 h-3" src={sortIcon} alt="Sort icon" />
                </div>
              </th>
              <th
                className="text-center gap-1 cursor-pointer max-md:hidden"
                onClick={() => handleSort("fechaOficio")}
              >
                <div className="flex items-center justify-center gap-1 w-full">
                  <span className="w-fit">Fecha Oficio</span>
                  <img className="w-3 h-3" src={sortIcon} alt="Sort icon" />
                </div>
              </th>
              <th
                className="text-center gap-1 cursor-pointer "
                onClick={() => handleSort("fechaGaceta")}
              >
                <div className="flex items-center justify-center gap-1 w-full">
                  <span className="w-fit">Fecha Gaceta</span>
                  <img className="w-3 h-3" src={sortIcon} alt="Sort icon" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedNotifications.map((notification) => (
              <tr
                className="text-center border-b border-gray-700"
                key={notification.id_notification}
              >
                <td>
                  <span className="flex items-center justify-center py-2">
                    {notification.numExp}
                  </span>
                </td>
                <td className="max-md:hidden">
                  <span className="flex items-center justify-center py-2">
                    {notification.numReg}
                  </span>
                </td>
                <td className="max-md:hidden">
                  <span className="flex items-center justify-center py-2">
                    {notification.serExp}
                  </span>
                </td>
                <td>
                  <a
                    className="flex items-center justify-center py-2"
                    href={notification.urlOficio}
                    target="_blank"
                  >
                    {notification.descOficio}
                  </a>
                </td>
                <td className="max-md:hidden">
                  <span className="flex items-center justify-center py-2">
                    {notification.numOficio}
                  </span>
                </td>
                <td className="max-md:hidden">
                  <span className="flex items-center justify-center py-2">
                    {new Intl.DateTimeFormat("default", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    }).format(new Date(new Date(notification.fechaOficio).toLocaleString('en-US', { timeZone: 'UTC' })))}
                  </span>
                </td>
                <td>
                  <span className="flex items-center justify-center py-2">
                    {new Intl.DateTimeFormat("default", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    }).format(new Date(new Date(notification.fechaGaceta).toLocaleString('en-US', { timeZone: 'UTC' })))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center py-5 mb-6">
                    <Paginate
                      pageCount={totalPages}
                      onPageChange={({ selected }) => setCurrentPage(selected)}
                      marginPagesDisplayed={1}
                      pageRangeDisplayed={3}
                      previousLabel="<Ant"
                      nextLabel="Sig>"
                      breakLabel="..."
                      breakClassName="break-me"
                      pageLinkClassName="p-3 max-sm:p-1.5 hover:rounded-full"
                      containerClassName="flex gap-2 max-sm:gap-1"
                      previousLinkClassName="p-3 rounded-full max-sm:p-1.5"
                      nextLinkClassName="p-3 max-sm:p-1.5 rounded-full"
                      breakLinkClassName="p-3 max-sm:p-1.5"
                      activeLinkClassName="bg-feature rounded-full text-white font-bold"
                    />
                  </div>
      </section>
    </>
  );
}

export default TableNotifications;
