// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api, { getImageUrl } from '../services/api';   // ← This was missing!
import { toast } from 'react-toastify';

function Profile({ userRole = 'user', isLoggedIn = true }) {
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    joinedDate: '',
    role: userRole,
    _id: '',
  });

  const [bookings, setBookings] = useState([]);
  const [ownedHostels, setOwnedHostels] = useState([]);

  const [ownerStats, setOwnerStats] = useState({
    totalSeats: 0,
    occupiedSeats: 0,
    availableSeats: 0,
    monthlyEarnings: '₹0',
    pendingBookings: 0,
  });

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Get User Profile
        const profileRes = await api.get('/profile');
        const user = profileRes.data || {};

        const normalizedUser = {
          ...user,
          _id: user._id || user.id,
          id: user.id || user._id,
        };

        setUserData({
          name: normalizedUser.name || '',
          email: normalizedUser.email || '',
          phone: normalizedUser.phone || '',
          joinedDate: normalizedUser.joinedDate
            ? new Date(normalizedUser.joinedDate).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })
            : 'N/A',
          role: normalizedUser.role || userRole,
          _id: normalizedUser._id,
        });

        // 2. Role-specific data
        if (normalizedUser.role === 'user' || userRole === 'user') {
          // Student Bookings
          const bookingsRes = await api.get('/bookings/user');
          let studentBookings = bookingsRes.data?.bookings || bookingsRes.data || [];
          setBookings(Array.isArray(studentBookings) ? studentBookings : []);

        } else if (normalizedUser.role === 'owner' || userRole === 'owner') {
          // Owner Hostels - Use dedicated endpoint
          const hostelsRes = await api.get('/hostels/my-hostels');
          let myHostels = hostelsRes.data?.hostels || hostelsRes.data || [];
          setOwnedHostels(Array.isArray(myHostels) ? myHostels : []);

          // Owner Bookings
          const bookingsRes = await api.get('/bookings/owner');
          let ownerBookings = bookingsRes.data?.bookings || bookingsRes.data || [];

          // Calculate Stats
          let total = 0, occupied = 0;
          myHostels.forEach((h) => {
            (h.rooms || []).forEach((r) => {
              total += Number(r.totalSeats || 0);
              occupied += Number(r.occupied || 0);
            });
          });

          const pending = ownerBookings.filter((b) => b.status === 'Pending').length;
          const earnings = ownerBookings.reduce((sum, b) => sum + Number(b.price || 0), 0) * 0.8;

          setOwnerStats({
            totalSeats: total,
            occupiedSeats: occupied,
            availableSeats: total - occupied,
            monthlyEarnings: `₹${Math.round(earnings).toLocaleString()}`,
            pendingBookings: pending,
          });

          setBookings(Array.isArray(ownerBookings) ? ownerBookings : []);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        const msg = err.response?.data?.message || 'Failed to load profile data';
        setError(msg);
        toast.error(msg);
        setBookings([]);
        setOwnedHostels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [isLoggedIn, userRole]);

  const handleSave = async () => {
    if (!userData.name?.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      await api.put('/profile', {
        name: userData.name.trim(),
        phone: userData.phone?.trim() || '',
      });

      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  if (!isLoggedIn) {
    return (
      <section className="py-5 bg-light min-vh-100 d-flex align-items-center">
        <Container>
          <Card className="text-center p-5 shadow-lg">
            <i className="bi bi-shield-lock fs-1 text-warning mb-4"></i>
            <h2>Please Login</h2>
            <p className="text-muted fs-5">You need to be logged in to view your profile.</p>
            <Button onClick={() => navigate('/login')} variant="primary" size="lg" className="rounded-pill px-5 mt-3">
              Login Now
            </Button>
          </Card>
        </Container>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-5 text-center min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
        <h4 className="ms-3">Loading your profile...</h4>
      </section>
    );
  }

  return (
    <section className="profile-page py-5 bg-light min-vh-100">
      <Container>
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        <Row className="mb-5">
          <Col>
            <h2 className="fw-bold text-primary text-center mb-4">
              <i className="bi bi-person-circle me-3"></i> My Profile
            </h2>
          </Col>
        </Row>

        {/* Profile Header + Info */}
        <Row className="mb-5 g-4">
          <Col lg={4}>
            <Card className="text-center shadow-lg border-0 h-100">
              <Card.Body className="p-5">
                <div
                  className={`rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center ${
                    userData.role === 'owner' ? 'bg-success' : 'bg-primary'
                  } text-white`}
                  style={{ width: '120px', height: '120px' }}
                >
                  <i className={`bi ${userData.role === 'owner' ? 'bi-building' : 'bi-person'} fs-1`}></i>
                </div>

                {!editMode ? (
                  <>
                    <h4 className="fw-bold">{userData.name || 'User'}</h4>
                    <p className="text-muted">{userData.role === 'owner' ? 'Hostel Owner' : 'Student'}</p>
                    <Badge bg={userData.role === 'owner' ? 'warning' : 'success'} className="fs-6">
                      {userData.role === 'owner' ? 'Verified Owner' : 'Active Member'}
                    </Badge>
                  </>
                ) : (
                  <Form.Control
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    className="text-center fw-bold fs-4 border-primary"
                  />
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="shadow-lg border-0 h-100">
              <Card.Body className="p-5">
                <h5 className="fw-bold text-primary mb-4">
                  <i className="bi bi-person-lines-fill me-2"></i> Personal Information
                </h5>

                {!editMode ? (
                  <ListGroup variant="flush">
                    <ListGroup.Item><strong>Email:</strong> {userData.email}</ListGroup.Item>
                    <ListGroup.Item><strong>Phone:</strong> {userData.phone || 'Not provided'}</ListGroup.Item>
                    <ListGroup.Item><strong>Member Since:</strong> {userData.joinedDate}</ListGroup.Item>
                  </ListGroup>
                ) : (
                  <>
                    <Form.Group className="mb-4">
                      <Form.Label>Email (cannot change)</Form.Label>
                      <Form.Control type="email" value={userData.email} disabled />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </Form.Group>
                  </>
                )}

                <div className="text-end mt-4">
                  {!editMode ? (
                    <Button variant="outline-primary" onClick={() => setEditMode(true)} className="rounded-pill px-5">
                      <i className="bi bi-pencil me-2"></i> Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button variant="secondary" onClick={() => setEditMode(false)} className="me-3 rounded-pill px-4">
                        Cancel
                      </Button>
                      <Button variant="primary" onClick={handleSave} className="rounded-pill px-5">
                        <i className="bi bi-check-lg me-2"></i> Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Student Bookings */}
        {userData.role !== 'owner' && (
          <Row>
            <Col>
              <h4 className="fw-bold text-primary mb-4">
                <i className="bi bi-calendar-check me-2"></i> 
                My Bookings ({bookings.length})
              </h4>

              {bookings.length === 0 ? (
                <Card className="text-center p-5 bg-white shadow-sm">
                  <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
                  <p className="text-muted fs-5">No bookings yet!</p>
                  <Button variant="primary" onClick={() => navigate('/hostels')} className="rounded-pill px-5 mt-3">
                    Find Hostels
                  </Button>
                </Card>
              ) : (
                <Row className="g-4">
                  {bookings.map((booking) => (
                    <Col md={6} lg={4} key={booking._id}>
                      <Card className="shadow-sm border-0 h-100 hover-lift">
                        <Card.Body>
                          <div className="d-flex justify-content-between mb-3">
                            <h6 className="fw-bold">{booking.hostel?.name || 'Hostel'}</h6>
                            <Badge bg={booking.status === 'Confirmed' ? 'success' : 'warning'}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-muted mb-2">
                            <i className="bi bi-door-open me-2"></i> {booking.roomType}
                          </p>
                          <p className="text-muted mb-2">
                            <i className="bi bi-currency-rupee me-2"></i> 
                            ₹{booking.price?.toLocaleString()}/month
                          </p>
                          <p className="text-muted mb-0">
                            <i className="bi bi-calendar me-2"></i> Check-in:{' '}
                            {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Col>
          </Row>
        )}

        {/* Owner Section */}
        {userData.role === 'owner' && (
          <>
            <Row className="g-4 mb-5">
              <Col md={4}>
                <Card className="text-center shadow-sm border-0">
                  <Card.Body>
                    <i className="bi bi-currency-rupee fs-1 text-success mb-3"></i>
                    <h6 className="text-muted">Monthly Earnings</h6>
                    <h4 className="fw-bold text-success">{ownerStats.monthlyEarnings}</h4>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center shadow-sm border-0">
                  <Card.Body>
                    <i className="bi bi-person-plus fs-1 text-primary mb-3"></i>
                    <h6 className="text-muted">Occupancy Rate</h6>
                    <h4 className="fw-bold text-primary">
                      {ownerStats.totalSeats > 0 ? Math.round((ownerStats.occupiedSeats / ownerStats.totalSeats) * 100) : 0}%
                    </h4>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center shadow-sm border-0">
                  <Card.Body>
                    <i className="bi bi-bell fs-1 text-warning mb-3"></i>
                    <h6 className="text-muted">Pending Bookings</h6>
                    <h4 className="fw-bold text-warning">{ownerStats.pendingBookings}</h4>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mb-5">
              <Col>
                <h4 className="fw-bold text-primary mb-4">
                  <i className="bi bi-building me-2"></i> My Hostels ({ownedHostels.length})
                </h4>

                {ownedHostels.length === 0 ? (
                  <Card className="text-center p-5 bg-white shadow-sm">
                    <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
                    <p className="text-muted fs-5">You haven't published any hostels yet!</p>
                    <Button variant="success" onClick={() => navigate('/owner-dashboard')} className="rounded-pill px-5 mt-3">
                      Add Your First Hostel
                    </Button>
                  </Card>
                ) : (
                  <Row className="g-4">
                    {ownedHostels.map((hostel) => (
                      <Col md={6} lg={4} key={hostel._id}>
                        <Card className="shadow-sm border-0 h-100 hover-lift">
                          <Card.Img
                            variant="top"
                            src={getImageUrl(hostel.images?.[0])}
                            style={{ height: '200px', objectFit: 'cover' }}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/400x250?text=Hostel'}
                          />
                          <Card.Body>
                            <Card.Title className="fw-bold">{hostel.name}</Card.Title>
                            <p className="text-muted mb-2">
                              <i className="bi bi-geo-alt me-2"></i> {hostel.location}
                            </p>
                            <p className="text-muted mb-3">
                              <i className="bi bi-people me-2"></i> {hostel.availableSeats || 0} seats available
                            </p>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              as={Link}
                              to={`/hostel/${hostel._id}`}
                              className="w-100 rounded-pill"
                            >
                              View Details
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Col>
            </Row>

            <div className="text-center mt-5">
              <Button
                href="/owner-dashboard"
                size="lg"
                variant="success"
                className="rounded-pill px-5 py-3 fw-bold shadow-lg"
              >
                <i className="bi bi-speedometer2 me-2"></i> Go to Full Owner Dashboard
              </Button>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}

export default Profile;