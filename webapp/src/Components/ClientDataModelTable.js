import React from 'react';
import { Table } from 'react-bootstrap';

const ClientDataModelTable = ({ clientDataModel }) => {
  // Helper function to retrieve value by path
  const getValueByPath = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

  // Define the structure of categories based on JSON keys
  const categories = {
    "Personal Information": [
      { label: "First Name", path: "client.personal_information.first_name" },
      { label: "Last Name", path: "client.personal_information.last_name" },
      { label: "Date of Birth", path: "client.personal_information.date_of_birth" },
      { label: "SSN", path: "client.personal_information.ssn" },
      { label: "Phone Number", path: "client.personal_information.phone_number" },
      { label: "Email Address", path: "client.personal_information.email_address" },
      { label: "Occupation Title", path: "client.personal_information.occupation.title" },
      { label: "Occupation Type", path: "client.personal_information.occupation.type" },
      { label: "Annual Income", path: "client.personal_information.annual_income" },
      { label: "Own or Rent", path: "client.personal_information.housing_status.own_or_rent" },
      { label: "Marital Status", path: "client.personal_information.housing_status.marital_status" },
      { label: "Citizenship", path: "client.personal_information.citizenship_status.citizenship" }
    ],
    "Account Details": [
      { label: "Account Type", path: "client.account_details.account_type" },
      { label: "Account Purpose", path: "client.account_details.account_purpose" },
      { label: "Initial Deposit Amount", path: "client.account_details.initial_deposit_amount" },
      { label: "Account Opening Date", path: "client.account_details.account_opening_date" },
      { label: "Branch Location", path: "client.account_details.branch_location" }
    ],
    "Address": [
      { label: "Street", path: "client.address.street" },
      { label: "City", path: "client.address.city" },
      { label: "State", path: "client.address.state" },
      { label: "ZIP Code", path: "client.address.zip_code" }
    ],
    "Identification": [
      { label: "Driving License Number", path: "client.identification.driving_license.license_number" },
      { label: "DL Expiry Date", path: "client.identification.driving_license.expiry_date" },
      { label: "DL Issue Date", path: "client.identification.driving_license.issue_date" },
      { label: "DL Issue State", path: "client.identification.driving_license.issue_state" }
    ]
  };

  return (
    <div className="scrollable-section">
    <h2>Client Data Model</h2>
    {Object.keys(categories).map((category) => (
      <div key={category} className="mb-4">
        <h4>{category}</h4>
        <div > {/* Apply scrollable class */}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Entity</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {categories[category].map((item, index) => (
                <tr key={index}>
                  <td>{item.label}</td>
                  <td>{getValueByPath(clientDataModel, item.path) || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    ))}
  </div>
  );
};

export default ClientDataModelTable;
