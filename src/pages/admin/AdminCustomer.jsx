import React, { useState } from 'react';
import Header from '../../components/Header';
import { usePolicy } from '../../context/PolicyContext'; // Import usePolicy to get customers
import { Pencil, Trash2, Eye, Search } from 'lucide-react';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal'; // Assuming this component exists

const AdminCustomer = () => {
  // Get customers, deleteCustomer, updateCustomerInFirestore, isAuthReady from PolicyContext
  const { customers, deleteCustomer, updateCustomerInFirestore, isAuthReady } = usePolicy();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDeleteId, setCustomerToDeleteId] = useState(null);
  const [editCustomerModalOpen, setEditCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  const itemsPerPage = 5;

  // Filter and search customers
  const filteredCustomers = customers.filter(customer => {
    const customerName = customer.customerName?.toLowerCase() || '';
    const email = customer.email?.toLowerCase() || '';
    const phoneNumber = customer.phoneNumber?.toLowerCase() || '';
    const vehicleNumber = customer.vehicleNumber?.toLowerCase() || '';

    return (
      customerName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      phoneNumber.includes(searchTerm.toLowerCase()) ||
      vehicleNumber.includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleDeleteClick = (customerId) => {
    setCustomerToDeleteId(customerId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteCustomer = async () => {
    if (customerToDeleteId) {
      await deleteCustomer(customerToDeleteId); // Call deleteCustomer from PolicyContext
    }
    setDeleteModalOpen(false);
    setCustomerToDeleteId(null);
  };

  const handleEditClick = (customer) => {
    setCustomerToEdit({ ...customer }); // Create a copy to edit
    setEditCustomerModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCustomerToEdit(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateCustomer = async () => {
    if (customerToEdit && customerToEdit.id) { // Use customer.id which is the Firestore document ID
      const { id, ...updatedFields } = customerToEdit; // Separate ID from fields to update
      await updateCustomerInFirestore(id, updatedFields); // Call updateCustomerInFirestore
      setEditCustomerModalOpen(false);
      setCustomerToEdit(null);
    }
  };

  const handleViewClick = (customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  };

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manage Customers</h1>
            <p className="text-gray-600">View and manage all your RSA customers</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isAuthReady && paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((customer, index) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + startIndex + 1} {/* Correct ID for pagination */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.vehicleNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewClick(customer)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Customer"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditClick(customer)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Customer"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(customer.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Customer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      {isAuthReady ? "No customers found matching your criteria." : "Loading customers..."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {isAuthReady && filteredCustomers.length > itemsPerPage && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, filteredCustomers.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredCustomers.length}</span> results
                </p>
              </div>
              <div>
                <nav className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>

                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === page
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>

        {/* View Customer Modal */}
        {viewModalOpen && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4">Customer Details</h2>
              <p><strong>Name:</strong> {selectedCustomer.customerName}</p>
              <p><strong>Email:</strong> {selectedCustomer.email}</p>
              <p><strong>Phone:</strong> {selectedCustomer.phoneNumber}</p>
              <p><strong>Address:</strong> {selectedCustomer.address}, {selectedCustomer.city}</p>
              <p><strong>Vehicle:</strong> {selectedCustomer.vehicleNumber}</p>
              <p><strong>Member Since:</strong> {selectedCustomer.createdAt ? format(selectedCustomer.createdAt, 'dd/MM/yyyy') : 'N/A'}</p>
              <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => setViewModalOpen(false)}
              >Close</button>
            </div>
          </div>
        )}

        {/* Edit Customer Modal */}
        {editCustomerModalOpen && customerToEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4">Edit Customer</h2>
              <label className="block text-sm font-medium text-gray-700">Customer Name</label>
              <input
                type="text"
                name="customerName"
                className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                value={customerToEdit.customerName}
                onChange={handleEditChange}
              />
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                value={customerToEdit.email}
                onChange={handleEditChange}
              />
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                value={customerToEdit.phoneNumber}
                onChange={handleEditChange}
              />
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                value={customerToEdit.address}
                onChange={handleEditChange}
              />
              <label className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                value={customerToEdit.city}
                onChange={handleEditChange}
              />
              <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
              <input
                type="text"
                name="vehicleNumber"
                className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                value={customerToEdit.vehicleNumber}
                onChange={handleEditChange}
              />
              <div className="flex space-x-2 mt-4">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={handleUpdateCustomer}
                >Update</button>
                <button
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  onClick={() => setEditCustomerModalOpen(false)}
                >Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <DeleteConfirmationModal
            message="Are you sure you want to delete this customer?"
            onConfirm={confirmDeleteCustomer}
            onCancel={() => setDeleteModalOpen(false)}
          />
        )}
      </main>
    </div>
  );
};

export default AdminCustomer;
