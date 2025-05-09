import React, { useState, useEffect, useContext } from 'react';
import { Layout, Input, Menu, Button, Switch, Modal, Drawer, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import '../CSS/navbar.css'; // Custom CSS file
import { UserContext } from '../Context/UserContext';  // Import UserContext
import { useSearch } from '../Context/SearchContext'; 

import rolePermissions from '../Context/rolePermissions';
import Login from './Login';
import Cookies from 'js-cookie'; // Import js-cookie
import { SettingOutlined, MenuOutlined } from '@ant-design/icons'; // Import settings cog icon

// Assets
import logo from '../Assets/logo.png';
import axios from 'axios';

const { Header } = Layout;
const { Search } = Input;

function Navbar() {
  const { setUserId, setUserName, userName, setUserRole, userRole } = useContext(UserContext);  // Destructure userName and setUserName
  const [isToggled, setIsToggled] = useState(false);
  const [users, setUsers] = useState([]); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loginText, setLoginText] = useState("Login");
  const [isSettingsVisible, setIsSettingsVisible] = useState(false); // For settings modal visibility
  const [drawerVisible, setDrawerVisible] = useState(false); //for hamburger menu on smaller screens
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  const role = userRole || 'guest'; // fallback role
  const permissions = rolePermissions[role];

  console.log("Navbar - userRole from context:", userRole);

  //mobile view state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const savedRole = Cookies.get('userRole');
    console.log("Saved role from cookies:", savedRole);
    if (savedRole) {
      setUserRole(savedRole);
      setLoginText("Logout");
    }
  }, []);


  const handleToggle = (checked) => {
    setIsToggled(checked);
    localStorage.setItem('sliderState', checked); // Save state to localStorage
  };

  const handleLogin = async (userId, userName, role) => {
    // Store user details in cookies for persistence across pages
    Cookies.set('userId', userId, { expires: 7 });
    Cookies.set('userName', userName, { expires: 7 });
    Cookies.set('userRole', role, { expires: 7 }); // Store user role

    console.log("Logging in with role:", role);
    // Update the context with the userId and userName
    setUserId(userId);
    setUserName(userName);
    setUserRole(role);

    // Update the login button text
    setLoginText("Logout");
    setIsModalVisible(false);
  };

  const handleLogout = () => {
    // Remove cookies on logout
    Cookies.remove('userId');
    Cookies.remove('userName');
    Cookies.remove('userRole');

    // Reset context values to logged-out state
    setUserId(null);
    setUserName(null);
    setUserRole(null);

    // Reset login button text
    setLoginText("Login");
    setIsSettingsVisible(false);
  };

  const showSettingsModal = () => {
    setIsSettingsVisible(true);
  };

  const handleCancelSettings = () => {
    setIsSettingsVisible(false);
  };

  // Navbar search 
  const { searchValue, setSearchValue } = useSearch(); // Get searchValue and setSearchValue
  const navigate = useNavigate();

  const onSearch = (value) => {
    navigate(`/browse-media?search=${value}`);
  };

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  const handleDeleteAccount = async () => {
    Modal.confirm({
      title: "Are you sure you want to delete your account?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const userId = Cookies.get('userId'); // Get the userId from cookies
          if (!userId) {
            Modal.error({ content: "User not found in cookies" });
            return;
          }
  
          // Send the DELETE request with the userId in the URL
          await axios.delete(`http://localhost:8080/api/user/delete/${userId}`);
  
          // On success, handle logout and show success message
          handleLogout();
          Modal.success({
            content: "Your account has been deleted successfully.",
          });
        } catch (error) {
          console.error("Error deleting account:", error);
          Modal.error({
            content: "There was an error deleting your account. Please try again later.",
          });
        }
      },
    });
  };
  
  


  return (
    <Layout>
      {/* Top Navbar */}
      <Header className="navbar-header">
        <div className="navbar-top">
          {/* Left: Logo and Title */}
          <div className="navbar-left">
            <a href="/" className="navbar-home-link">
              <img src={logo} alt="AML Logo" className="navbar-logo" />
              <span className="navbar-title">AML</span>
            </a>
          </div>  

          {/* Right: Search Bar and Login Button */}
          <div className="navbar-right">
          {isMobileView && (
          <Button
          className='hamburger-button'
          icon={<MenuOutlined />}
          onClick={toggleDrawer}
          />
            )}
            {!isMobileView && (
              <>
            <Search
              placeholder="Search"
              className="navbar-search"
              style={{ width: 250 }}
              value={searchValue} // Controlled input
              onChange={(e) => setSearchValue(e.target.value)} // Update search value
              onSearch={onSearch}
            />
              <Button
                type="primary"
                className="navbar-login"
                onClick={loginText === "Login" ? () => setIsModalVisible(true) : handleLogout} // Toggle login/logout
              >
                {loginText}
              </Button>
          {/* Settings Icon next to Login Button */}
          <SettingOutlined
            className="settings-icon"
            style={{ fontSize: '24px', color: '#white', marginLeft: '10px', cursor: 'pointer' }}
            onClick={showSettingsModal} // Open the settings modal
          />
          </>
            )}
          </div>
        </div>
      </Header>

      {/* Secondary Navbar */}
      <div className="secondary-navbar">
        <div style={{ flexGrow: 1 }}>
          <Menu mode="horizontal" className="secondary-menu">
            <Menu.Item key="browse-media">
              <a href="/browse-media">Browse Media</a>
            </Menu.Item>
            <Menu.Item key="manage-media">
              <a href="/manage-media">Manage Media</a>
            </Menu.Item>
            {permissions?.canViewManageInventory && (
              <Menu.Item key="manage-inventory">
                <a href="/manage-inventory">Manage Inventory</a>
              </Menu.Item>
            )}
          </Menu>
        </div>
      </div>

      {/* Drawer for small screens */}
      <Drawer
      title='Menu'
      placement='right'
      onClose={toggleDrawer}
      visible={drawerVisible}
      >
        {/* Search bar in Drawer */}
        <div className='drawer-search-section' style={{ marginTop: '20px' }}>
          <Input.Search
          placeholder='Search'
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={onSearch}
          enterButton
          className='drawer-search-bar'
          />
        </div>

        <Menu mode='vertical'>
          <Menu.Item key={'browse-media-mobile'}>
            <a href='/browse-media'>Browse Media</a>
          </Menu.Item>
          <Menu.Item key={'manage-media-mobile'}>
            <a href='/manage-media'>Manage Media</a>
          </Menu.Item>
          {permissions?.canViewManageInventory && (
            <Menu.Item key="manage-inventory-mobile">
              <a href="/manage-inventory">Manage Inventory</a>
            </Menu.Item>
          )}
        </Menu>

        {/* Login and Settings for hamburger menu */}
        <div className='drawer-login-section' style={{ marginTop: '20px' }}>
          <Button type='primary' block onClick={loginText === "Login" ? () => setIsModalVisible(true) : handleLogout}>
            {loginText}
          </Button>
          <Button
          type='default'
          block
          style={{ marginTop: '10px' }}
          icon={<SettingOutlined />}
          onClick={showSettingsModal}
          >
            Settings
          </Button>
        </div>
      </Drawer>

      {/* Login Modal */}
      <Login
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSuccess={handleLogin} // Pass the handleLogin function to the Login component
      />
      
      {/* Settings Modal for Logout */}
      <Modal
        title="Settings"
        visible={isSettingsVisible}
        onCancel={handleCancelSettings}
        footer={null}
      >
        <Button
          type="primary" danger onClick={handleLogout} block className="logout-btn"  
          >Logout
        </Button>
        <Button
          type="primary" danger onClick={handleDeleteAccount} block className="logout-btn"
        >
          Delete Account
        </Button>
      </Modal>
    </Layout>
  );
}

export default Navbar;