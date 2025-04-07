import React, { useEffect } from 'react';
import './Profile.css';
import img1 from '../Components/Assets/p1.png';
import img3 from '../Components/Assets/p2.png';
import img4 from '../Components/Assets/p3.png';
import img6 from '../Components/Assets/p4.png';
import img2 from '../Components/Assets/img39.jpg';
import bg12 from '../Components/Assets/bg12.png';
import emailIcon from '../Components/Assets/mails.png';
import websiteIcon from '../Components/Assets/website.png';
import addressIcon from '../Components/Assets/location.png';
import phoneIcon from '../Components/Assets/phonecall.png';  
import innovateIcon from '../Components/Assets/innovate.png';
import exploreIcon from '../Components/Assets/explore.png';
import empowerIcon from '../Components/Assets/empower.png';
import aboutus from '../Components/Assets/aboutus.png';

const Profile = () => {
  useEffect(() => {
    const sections = document.querySelectorAll('.profile-section');
    const headings = document.querySelectorAll('.profile-heading');
    const paragraphs = document.querySelectorAll('.profile-paragraph');
    const lists = document.querySelectorAll('.profile-list');
    const contactDetails = document.querySelectorAll('.contact-details p');
    const imageSections = document.querySelectorAll('.profile-image-section');
    const iconSections = document.querySelectorAll('.profile-icons-section');
    const iconItems = document.querySelectorAll('.icon-item');
    const footer = document.querySelector('.profile-footer');
    const observer = new IntersectionObserver(
      (entries) => {
        console.log('Observer entries:', entries); // Add this line
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );
  
    sections.forEach((section) => observer.observe(section));
    headings.forEach((heading) => observer.observe(heading));
    paragraphs.forEach((paragraph) => observer.observe(paragraph));
    lists.forEach((list) => observer.observe(list));
    contactDetails.forEach((detail) => observer.observe(detail));
    imageSections.forEach((section) => observer.observe(section));
    iconSections.forEach((section) => observer.observe(section));
    iconItems.forEach((item) => observer.observe(item));
    if (footer) observer.observe(footer);
  
    return () => {
      sections.forEach((section) => observer.unobserve(section));
      headings.forEach((heading) => observer.unobserve(heading));
      paragraphs.forEach((paragraph) => observer.unobserve(paragraph));
      lists.forEach((list) => observer.unobserve(list));
      contactDetails.forEach((detail) => observer.unobserve(detail));
      imageSections.forEach((section) => observer.unobserve(section));
      iconSections.forEach((section) => observer.unobserve(section));
      iconItems.forEach((item) => observer.unobserve(item));
      if (footer) observer.unobserve(footer);
    };
  }, []);

  return (
    <div className="profile-container">
      {/* Thrust Areas Section */}
      <div className="profile-section profile-thrust-areas">
        <h2 className="profile-heading">Thrust Areas of Focus</h2>
        <ul className="profile-list">
          <li>Sustainable Nanotechnology for Energy Solutions.</li>
          <li>Environmental Remediation.</li>
          <li>Biocompatibility and Healthcare Applications of Nanomaterials.</li>
          <li>Translational Research and Patenting.</li>
          <li>Entrepreneurship and Economic Viability.</li>
        </ul>
        <div className="profile-thrust-images">
          <img src={img1} alt="Thrust Area 1" className="profile-image" />
          <img src={img3} alt="Thrust Area 3" className="profile-image" />
          <img src={img4} alt="Thrust Area 4" className="profile-image" />
          <img src={img6} alt="Thrust Area 6" className="profile-image" />
        </div>
      </div>

     {/* Services Section */}
<div className="profile-section profile-services">
  <div className="services-content">
    <div className="services-text">
      <h2 className="profile-heading">Services</h2>
      <p className="profile-paragraph">
        The Centre for Nanomaterials Research and Innovation at MCC-MRF Innovation Park offers a wide range of services to support advanced research, including:
      </p>
      <h3 className="profile-subheading">Analysis using:</h3>
      <ul className="profile-list">
        <li>Fourier-transform infrared spectroscopy (FTIR)</li>
        <li>Ultraviolet-visible spectroscopy (UV-Vis)</li>
        <li>RT-PCR (Reverse Transcription Polymerase Chain Reaction)</li>
        <li>Electrochemical Workstation</li>
        <li>Mass spectrometry</li>
      </ul>
      <h3 className="profile-subheading">Processing techniques with access to:</h3>
      <ul className="profile-list">
        <li>Furnace</li>
        <li>Vacuum oven</li>
        <li>Hot air oven</li>
        <li>Bath sonicator</li>
        <li>Probe sonicator</li>
        <li>Sonicater with chiller</li>
        <li>Centrifuge</li>
        <li>Lyophilizer</li>
        <li>Multiparameter photometer</li>
      </ul>
      <h3 className="profile-subheading">Consultation services providing:</h3>
      <ul className="profile-list">
        <li>Expert guidance on research methodologies</li>
        <li>Assistance with equipment operation</li>
        <li>Support in experimental design to ensure successful project outcomes</li>
      </ul>
    </div>
    <div className="services-image">
      <img src={bg12} alt="Background Visual" className="bg12-image" />
    </div>
  </div>
</div>


      {/* Programs Section */}
      <div className="profile-section profile-programs">
        <h2 className="profile-heading">Programs</h2>
        <h3 className="profile-subheading">Pathway to Master's and Research in Materials Science:</h3>
        <p className="profile-paragraph">
          This program prepares students for master's degrees abroad, covering materials science, nanotechnology, and research methodologies. It offers subsidized fees, scholarships, part-time work opportunities, and fully funded research positions.
        </p>
        <h3 className="profile-subheading">Advanced Nanotechnology Workshops:</h3>
        <p className="profile-paragraph">
          These workshops focus on practical techniques like mass spectrometry, FTIR, and various processing methods. Led by experts, they provide hands-on training and valuable knowledge for both students and professionals.
        </p>
      </div>

{/* About Us Section */}
<div className="profile-section profile-about-us">
  <div className="about-us-container">
    <div className="about-us-content">
      <div className="about-us-text">
        <h2 className="profile-heading">About Us</h2>
        <p className="profile-paragraph">
          The Centre for Nanomaterials Research and Innovations (CNRI) at MCC-MRF Innovation Park is dedicated to advancing sustainable nanotechnology.
        </p>
        <ul className="profile-list">
          <li><strong>Energy Solutions:</strong> Enhancing energy storage, improving conversion efficiency, and promoting renewable energy.</li>
          <li><strong>Environmental Sustainability:</strong> Capturing carbon dioxide, purifying water, and transforming waste into valuable resources.</li>
          <li><strong>Enriching Healthcare:</strong> Responsible application of nanomaterials in healthcare, focusing on providing critical insights into their biocompatibility and safety.</li>
        </ul>
        <p className="profile-paragraph">
          We foster interdisciplinary research, translate innovations into real-world applications and patents, and work on R&D projects with researchers, startups, MSMEs, and industries.
        </p>
      </div>
      
     {/* Slanting Divider with Image */}
     <div className="about-us-image-wrapper">
        <div className="slanting-divider"></div>
        <img src={aboutus} alt="CNRI Research" className="about-us-image" />
      </div>
    </div>
  </div>
</div>

      {/* Contact Us Section */}
      <div className="profile-section profile-contact-us">
        <h2 className="profile-heading">Contact Us</h2>
        <div className="contact-grid">
          <div className="contact-item">
          <div className="icon-circle">
            <img src={emailIcon} alt="Email" className="icon-image" />
            </div>
            <div className="contact-content">
              <strong>Email</strong>
              <a href="mailto:cnri_mccmrfip@mcc.edu.in">cnri_mccmrfip@mcc.edu.in</a>
            </div>
          </div>

          <div className="contact-item">
          <div className="icon-circle">
            <img src={websiteIcon} alt="Website" className="icon-image" />
            </div>
            <div className="contact-content">
              <strong>Website</strong>
              <a href="https://www.mccmrfip.com" target="_blank" rel="noopener noreferrer">www.mccmrfip.com</a>
            </div>
          </div>

          <div className="contact-item">
          <div className="icon-circle">
            <img src={addressIcon} alt="Address" className="icon-image" />
            </div>
            <div className="contact-content">
              <strong>Address</strong>
              <div className="contact-address">
                MCC-MRF Innovation Park<br />
                Madras Christian College<br />
                East Tambaram, Chennai 600 059
              </div>
            </div>
          </div>

          <div className="contact-item">
          <div className="icon-circle">
            <img src={phoneIcon} alt="Phone" className="icon-image" />
            </div>
            <div className="contact-content">
              <strong>Phone</strong>
              <div>
                <a href="tel:+914422390076">044 22390076</a><br />
                <a href="tel:+917200099955">7200099955</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Image Section */}
      <div className="profile-section profile-image-section">
        <img src={img2} alt="CNRI Overview" className="full-width-image" />
      </div>

      {/* New Logo Icons Section */}
      <div className="profile-section profile-icons-section">
        <div className="icons-container">
          <div className="icon-item">
            <div className="icon-circle">
              <img src={innovateIcon} alt="Innovate" className="icon-image" />
            </div>
            <h3>Innovate</h3>
          </div>
          <div className="icon-item">
            <div className="icon-circle">
              <img src={exploreIcon} alt="Explore" className="icon-image" />
            </div>
            <h3>Explore</h3>
          </div>
          <div className="icon-item">
            <div className="icon-circle">
              <img src={empowerIcon} alt="Empower" className="icon-image" />
            </div>
            <h3>Empower</h3>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="profile-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Centre for Nanomaterials Research and Innovation</p>
          <p>MCC-MRF Innovation Park, Madras Christian College, Chennai</p>
        </div>
      </footer>
    </div>
  );
};

export default Profile;