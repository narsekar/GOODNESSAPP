import { Employee, ShiftType, ChangeRecord, WeekOffRecord } from './types';

export const SEED_EMPLOYEES: Employee[] = [
  {
    id: '1001',
    name: 'Swapnil Patil',
    designation: 'Roster Specialist',
    ward: 'D',
    shift: 'General Shift',
    unit: 'Unit 3',
    weekOff: 'Sunday',
    password: '123456'
  },
  {
    id: '1002',
    name: 'Priya Sharma',
    designation: 'Operations Analyst',
    ward: 'E',
    shift: 'General Shift',
    unit: '',
    weekOff: 'Monday',
    password: '123456'
  },
  {
    id: '1003',
    name: 'John Doe',
    designation: 'Office Clerk',
    ward: 'F',
    shift: 'General Shift',
    unit: '',
    weekOff: 'Wednesday',
    password: '123456'
  },
  {
    id: '1004',
    name: 'Aradhya Sen',
    designation: 'Data Entry Operator',
    ward: 'G',
    shift: 'General Shift',
    unit: '',
    weekOff: 'Saturday',
    password: '123456'
  },
  {
    id: '1005',
    name: 'Rajesh Kumar',
    designation: 'Billing Executive',
    ward: 'H',
    shift: 'General Shift',
    unit: 'Unit 1',
    weekOff: 'Thursday',
    password: '123456'
  },
  // BLUE COLLAR STAFF (20 TO 04 SHIFT)
  { id: '245', name: 'NIHAL ANANTA KAPSE', designation: 'PC DRIVER', ward: 'D', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '303', name: 'RAHUL LAXMAN KHODKE', designation: 'HELPER', ward: 'D', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '317', name: 'ROHIT SURESH KAMBLE', designation: 'HELPER', ward: 'D', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '344', name: 'SIDDHARTH MAHENDRA JAGTAP', designation: 'PC HELPER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '361', name: 'SAMADHAN RAVINDRA PAWAR', designation: 'PC HELPER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '362', name: 'AJAY BILLU ROGADI', designation: 'HELPER', ward: 'D', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '438', name: 'PADMAKAR KRUSHNA SUTAR', designation: 'HELPER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '442', name: 'PINTU GURUNATH MHATRE', designation: 'HELPER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '457', name: 'RAVI SHANKAR PATIL', designation: 'PC HELPER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '467', name: 'SAKHARAM UTTAMRAO AMBHURE', designation: 'PC HELPER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '506', name: 'VINOD BHIVA KAMBLE', designation: 'PC HELPER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '507', name: 'VINOD RAMLAL CHAVAN', designation: 'PC HELPER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '580', name: 'NURASING SHANKAR CHAVAN', designation: 'HMV', ward: 'D', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '588', name: 'GAURAV SUNIL PATIL', designation: 'PC DRIVER', ward: 'D', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '630', name: 'MANIK PANDIT RATHOD', designation: 'PC DRIVER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '643', name: 'ROHIDAS BALARAM BHOIR', designation: 'PC DRIVER', ward: 'H', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '687', name: 'RAJESH PANDHARINATH RANE', designation: 'PC DRIVER', ward: 'F', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '791', name: 'VIPUL GURUNATH GAIKWAD', designation: 'PC DRIVER', ward: 'F', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '795', name: 'AJAY SHREERAM THALE', designation: 'PC DRIVER', ward: 'F', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '805', name: 'TANMAY SACHIN GADKARI', designation: 'PC DRIVER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '817', name: 'PRAKASH BHASKAR PAWAR', designation: 'PC DRIVER', ward: 'F', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '823', name: 'BHARAT VASUDEV MHATRE', designation: 'PC DRIVER', ward: 'F', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '845', name: 'RUSHIKESH RAKESH MANE', designation: 'PC DRIVER', ward: 'D', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '856', name: 'RAM BABASAHEB GORE', designation: 'PC HELPER', ward: 'F', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '878', name: 'YOGINDAR MOHANLAL CHAUHAN', designation: 'HELPER', ward: 'D', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '910', name: 'SANDEEP DAGDU JADHAV', designation: 'PC HELPER', ward: 'F', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '924', name: 'SAHIL GURUNATH PATIL', designation: 'PC HELPER', ward: 'G', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '931', name: 'SHYAM BABASAHEB GORE', designation: 'PC HELPER', ward: 'G', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '947', name: 'AKASH PRAKASH ANGRE', designation: 'PC DRIVER', ward: 'G', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '948', name: 'JAYESH NAVNATH MHATRE', designation: 'PC DRIVER', ward: 'G', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '950', name: 'MANGESH CHANDRAKANT MHATRE', designation: 'PC DRIVER', ward: 'G', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '992', name: 'DHIRAJ KHADKSING BAROLIYA', designation: 'PC HELPER', ward: 'F', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '993', name: 'MAYUR RAKESH MHATRE', designation: 'PC HELPER', ward: 'G', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '998', name: 'YOGESH PANDURANG CHOUDHARI', designation: 'PC HELPER', ward: 'H', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1067', name: 'BHARAT PANDURANG KHAMBE', designation: 'PC HELPER', ward: 'I', unit: '', shift: '20 TO 04', weekOff: 'Saturday', password: '123456' },
  { id: '1076', name: 'SANJAY BALU TOKAL', designation: 'PC HELPER', ward: 'H', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1095', name: 'JEETU PRAKASH KHAVALIYA', designation: 'HELPER', ward: 'D', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1099', name: 'VISHNU PANDURANG SHINDE', designation: 'HELPER', ward: 'D', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1162', name: 'ANAND UTTAM BHUWAD', designation: 'HELPER', ward: 'H', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1217', name: 'DARSHAN KISHOR PATIL', designation: 'PC HELPER', ward: 'H', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1256', name: 'AKSHAY ARUN AGRE', designation: 'PC HELPER', ward: 'G', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1373', name: 'VISHAL BAJIRAO WAYLE', designation: 'HELPER', ward: 'F', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1392', name: 'NAYAN HANUMAN PATIL', designation: 'PC HELPER', ward: 'E', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1467', name: 'SACHIN TARACHANDRA MORE', designation: 'PC HELPER', ward: 'I', unit: '', shift: '20 TO 04', weekOff: 'Tuesday', password: '123456' },
  { id: '1497', name: 'PAWAN BALKRISHNA BHOIR', designation: 'PC DRIVER', ward: 'H', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1621', name: 'JAYDEEP JITENDRA WAGHMARE', designation: 'PC DRIVER', ward: 'I', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1629', name: 'NIKHIL ANIL MALI', designation: 'PC DRIVER', ward: 'I', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1712', name: 'YADNESH KISAN THAKE', designation: 'HELPER', ward: 'E', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1718', name: 'RUTIK SHREERAM BHANDARI', designation: 'HELPER', ward: 'E', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1732', name: 'VARSION ARJUN RATHOD', designation: 'HELPER', ward: 'D', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1758', name: 'MAHESH ANANTA SUROSHE', designation: 'PC HELPER', ward: 'I', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1766', name: 'GORAKHNATH RAJU RATHOD', designation: 'PC HELPER', ward: 'E', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1767', name: 'RAHUL PRAKASH RATHOD', designation: 'HELPER', ward: 'E', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1784', name: 'VARUN SANTOSH PATIL', designation: 'PC DRIVER', ward: 'E', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1790', name: 'RONIT DEEPAK BHOIR', designation: 'PC DRIVER', ward: 'E', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1808', name: 'HARESH LAHU GAIKWAD', designation: 'PC DRIVER', ward: 'E', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1830', name: 'RAHUL UTTAM JAGTAP', designation: 'PC DRIVER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1853', name: 'DIPAK SANDIP PANDIT', designation: 'PC DRIVER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1863', name: 'ROSHAN DHANAJI THAKUR', designation: 'HELPER', ward: 'E', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1969', name: 'VISHWAS EKNATH DESALE', designation: 'HMV', ward: 'D', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1982', name: 'KARAN ROHIDAS KALAN', designation: 'PC HELPER', ward: 'H', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1988', name: 'NAYAN VALMIKI PATIL', designation: 'HELPER', ward: 'F', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1991', name: 'PRASAD ANANTA MADHAVI', designation: 'PC HELPER', ward: 'H', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '1998', name: 'SURAJ DNYANESHWAR MAGAR', designation: 'PC DRIVER', ward: 'I', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '2028', name: 'SURESH NEMICHAND CHAVAN', designation: 'PC HELPER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '2066', name: 'SAHIL SUNIL SEVEKAR', designation: 'PC DRIVER', ward: 'H', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '2163', name: 'MEGHRAJ GORAKHNATH GAIKWAD', designation: 'PC DRIVER', ward: 'I', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '2204', name: 'HEMANT ATMARAM PARMAR', designation: 'HELPER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '2253', name: 'SADANAND BALARAM SONAVNE', designation: 'PC HELPER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '2257', name: 'SANTOSH RAJPAT YADAV', designation: 'PC HELPER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '2278', name: 'ANIKET ANIL DANI', designation: 'HELPER', ward: 'F', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '2282', name: 'RAHUL RAMESH MADHVI', designation: 'PC DRIVER', ward: 'J', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '2292', name: 'VAIBHAV SANJAY MHATRE', designation: 'PC DRIVER', ward: 'H', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '2329', name: 'DEEPAK SUNIL PAWAR', designation: 'HMV', ward: 'D', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '2360', name: 'RAHUL DIXIT', designation: 'PC HELPER', ward: 'I', unit: 'Depot', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '2362', name: 'KANTARAM D. GHARAT', designation: 'HELPER', ward: 'G', unit: '', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },
  { id: '2364', name: 'PAVAN KAIWAJ', designation: 'HELPER', ward: 'H', unit: 'Depot', shift: '20 TO 04', weekOff: 'Sunday', password: '123456' },

  // BLUE COLLAR STAFF (C SHIFT)
  { id: '176', name: 'DATTATREY EKNATH BHAGAT', designation: 'HELPER', ward: 'F', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '180', name: 'SANTOSH NAMDEO SHINGOLE', designation: 'HMV', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '181', name: 'PRASHANT GURUNATH SHELAR', designation: 'HMV', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '292', name: 'BALKRISHNA ARUN BAVISKAR', designation: 'HMV', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '293', name: 'RAMKISAN ARUN BAVISKAR', designation: 'PC HELPER', ward: 'J', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '314', name: 'NANDU DEVRAM ARE', designation: 'HELPER', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '340', name: 'UTTAM BUDHA POKALE', designation: 'HELPER', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '353', name: 'PURUSHOTTAM RAMAKANT PARDE', designation: 'HELPER', ward: 'J', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '369', name: 'AMAN AHMAD KHAN', designation: 'SWEEPER', ward: 'F', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '394', name: 'GANESH BALARAM PATIL', designation: 'HELPER', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '420', name: 'MAHESH CHAGAN HATANGALE', designation: 'HELPER', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Tuesday', password: '123456' },
  { id: '463', name: 'ROHIT SITARAM AGIVALE', designation: 'HELPER', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '659', name: 'SWAPNIL BABU PAWAR', designation: 'HELPER', ward: 'J', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '704', name: 'MURUGAN THANGVEL VELAUTHAM', designation: 'HELPER', ward: 'H', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '712', name: 'DIPAK MANGESH MUKANE', designation: 'HELPER', ward: 'F', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '770', name: 'RAJEBHAU SANTARAM SATHE', designation: 'HELPER', ward: 'F', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '806', name: 'KAPIL KRISHNA BHANDARI', designation: 'SWEEPER', ward: 'G', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '812', name: 'SAURAV RAJENDRA TATHE', designation: 'HELPER', ward: 'F', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '851', name: 'SUNIL NANA LANDGE', designation: 'HELPER', ward: 'F', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '853', name: 'SUNIL ANIL AARUSUL', designation: 'HELPER', ward: 'G', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '854', name: 'BHARAT DEVRAM ARE', designation: 'PC HELPER', ward: 'F', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '923', name: 'CHANDRAKANT MARUTI KHADE', designation: 'SWEEPER', ward: 'G', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '933', name: 'BHUSHAN KAILAS GORPEKAR', designation: 'PC HELPER', ward: 'G', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '995', name: 'ANIKET RAVINATH SHELAR', designation: 'PC HELPER', ward: 'G', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1081', name: 'MANGESH LAHU CHIKANKAR', designation: 'HELPER', ward: 'I', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1122', name: 'NILESH LAXMAN PATIL', designation: 'HELPER', ward: 'H', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1133', name: 'PRASHANT TANAJI BANDAL', designation: 'PC HELPER', ward: 'H', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1148', name: 'SANJAY GOPICHAND SAKPALE', designation: 'SWEEPER', ward: 'G', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1153', name: 'BHARAT VASANT NAROTE', designation: 'PC HELPER', ward: 'H', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1195', name: 'NARESH BHAGAVAT KADAM', designation: 'HELPER', ward: 'H', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1215', name: 'SUBHASH PUNDLIK PATIL', designation: 'HELPER', ward: 'H', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1248', name: 'SANKET SANJAY GARUD', designation: 'HELPER', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1263', name: 'MAYUR CHANDRAKANT MHATRE', designation: 'SWEEPER', ward: 'G', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1297', name: 'SANDIP HARIDAS THOOL', designation: 'HELPER', ward: 'H', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1307', name: 'DARSHAN RAMCHANDRA BHALERAO', designation: 'HELPER', ward: 'H', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1337', name: 'RAJAN BABASAHEB JAVLE', designation: 'HELPER', ward: 'H', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1338', name: 'AVINASH SURESH GAIKWAD', designation: 'HELPER', ward: 'I', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1413', name: 'VINOD LAXMAN RAYBOLE', designation: 'HELPER', ward: 'G', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1606', name: 'RAJGOLKAR BASAWANT ISHWAR', designation: 'HELPER', ward: 'I', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1643', name: 'PRATIK SHIVDAS TARE', designation: 'HELPER', ward: 'I', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1661', name: 'JAYESH GAJANAN KHUNE', designation: 'HELPER', ward: 'G', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1682', name: 'YASHWANT PANDURANG BHALA', designation: 'HELPER', ward: 'E', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1687', name: 'BHAU BALU BHALE', designation: 'HELPER', ward: 'E', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1723', name: 'RAVI RAMESH RATHOD', designation: 'HELPER', ward: 'E', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1887', name: 'PREM VISHWANATH PATIL', designation: 'HELPER', ward: 'E', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1899', name: 'ANIKET KISAN LATE', designation: 'HELPER', ward: 'E', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1943', name: 'SAGAR VIJAY GURAV', designation: 'HMV', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1947', name: 'AZIZ KHAN RUSTAMKHAN', designation: 'HMV', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1957', name: 'JITESH GURUNATH PATIL', designation: 'PC HELPER', ward: 'F', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1958', name: 'YADNESH LAXMAN MADHAVI', designation: 'SWEEPER', ward: 'F', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1979', name: 'OMKAR ROHIDAS GAIKAR', designation: 'HELPER', ward: 'F', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '1992', name: 'AJAY ANANTA MADHAVI', designation: 'SWEEPER', ward: 'F', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2027', name: 'JAGDISH ROHIDAS PAWAR', designation: 'HELPER', ward: 'J', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2036', name: 'YOGESH LAHU CHIKANKAR', designation: 'HELPER', ward: 'J', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2044', name: 'KIRAN CHANDRAKANT DHANAVATE', designation: 'HELPER', ward: 'E', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2045', name: 'ANSH VILAS SONAVANE', designation: 'HELPER', ward: 'J', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2049', name: 'GANESH RAJAYA KOTA', designation: 'HELPER', ward: 'H', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2050', name: 'NARESH DEEPAK DHIVRE', designation: 'HELPER', ward: 'J', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2052', name: 'GAURAV SANDEEP BARVE', designation: 'HELPER', ward: 'J', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2060', name: 'LALAN KUMAR', designation: 'HELPER', ward: 'J', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2063', name: 'AKSHAY RAVINDAR TELURE', designation: 'HELPER', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2095', name: 'SUNIL DAGDU MANE', designation: 'HMV', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2106', name: 'RAKESH PANDIT PATIL', designation: 'HMV', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2149', name: 'KIRAN MANIK RATHOD', designation: 'HMV', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2152', name: 'RAHIM NAJIR SHAIKH', designation: 'HELPER', ward: 'F', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2160', name: 'VIRAJ NAMDEV BHOIR', designation: 'HMV', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2241', name: 'KONAR BALAKRISHNAN K ESAKKIMUTU', designation: 'HELPER', ward: 'E', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2269', name: 'VISHAL TUKARAM SABALE', designation: 'HELPER', ward: 'F', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2279', name: 'SUDAM GAJMAL CHAURE', designation: 'HMV', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2280', name: 'DURGESH GORAKH PAWAR', designation: 'HMV', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2345', name: 'DARSHAN DINESH JADHAV', designation: 'HMV', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2350', name: 'BHIMASHANKAR CHANDU TOLE', designation: 'HMV', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2358', name: 'MEHUL GAIKWAD', designation: 'HELPER', ward: 'H', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2361', name: 'PRAYAG GHARAT', designation: 'HELPER', ward: 'H', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' },
  { id: '2368', name: 'VIKAS MADHUKAR GAWLI', designation: 'HMV', ward: 'D', unit: '', shift: 'C Shift', weekOff: 'Sunday', password: '123456' }
];

export const DESIGNATIONS = [
  'Roster Specialist',
  'Operations Analyst',
  'Office Clerk',
  'Data Entry Operator',
  'Billing Executive',
  'HELPER',
  'PC HELPER',
  'PC DRIVER',
  'HMV',
  'SWEEPER'
];

export const WARDS = [
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J'
];

export const SHIFTS: ShiftType[] = [
  'A Shift',
  'B Shift',
  'C Shift',
  'Night Shift',
  'General Shift'
];

export const UNITS = [
  'Unit 1',
  'Unit 2',
  'Unit 3',
  'Unit 4',
  'Unit 5'
];

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

// Helper to format date for local display
export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Generate the WhatsApp Sharing Text (Optimized to be extremely concise with minimal words / pure data format)
export function generateWhatsAppMessage(record: ChangeRecord): string {
  const nameShort = record.empName.length > 20 ? record.empName.slice(0, 18) + '..' : record.empName;
  return `*Goodness App* | 🟢 *WEEK OFF CHANGE*\n*Emp:* ${nameShort} (${record.empId})\n*Change:* ${record.previousWeekOff} ➔ ${record.newWeekOff}\n*By:* ${record.submittedBy}\n*Time:* ${formatDateTime(record.timestamp)}`;
}

// Create share link for WhatsApp
export function getWhatsAppShareUrl(text: string): string {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

// Export Records to CSV File with Ward Filter or Ward-wise separation
export function exportToCSV(records: ChangeRecord[], filterType: string, selectedWard?: string) {
  let filtered = [...records];
  let csvContent = 'data:text/csv;charset=utf-8,';
  
  // Headers
  const headers = [
    'Record ID',
    'Record Type',
    'Employee ID',
    'Employee Name',
    'Submitted By',
    'Submitted Role',
    'Timestamp',
    'Old Week Off',
    'New Week Off',
    'WhatsApp Message Text'
  ];
  
  csvContent += headers.join(',') + '\r\n';

  filtered.forEach((rec) => {
    const whatsAppText = generateWhatsAppMessage(rec);
    const row = [
      rec.id,
      'Week Off Change',
      rec.empId,
      `"${rec.empName.replace(/"/g, '""')}"`,
      `"${rec.submittedBy.replace(/"/g, '""')}"`,
      rec.submittedByRole,
      new Date(rec.timestamp).toISOString(),
      rec.previousWeekOff,
      rec.newWeekOff,
      `"${whatsAppText.replace(/"/g, '""')}"`
    ];
    csvContent += row.join(',') + '\r\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  
  const wardTag = selectedWard && selectedWard !== 'all' ? `_ward_${selectedWard.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
  const filename = `goodness_records_${filterType}${wardTag}_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export active Employees Roster directly to Excel (CSV) ward-wise
export function exportEmployeesToCSV(employees: Employee[], selectedWard: string) {
  let filtered = [...employees];
  if (selectedWard && selectedWard !== 'all') {
    filtered = employees.filter(e => e.ward === selectedWard);
  }

  // Sort by ward so it's beautifully organized
  filtered.sort((a, b) => a.ward.localeCompare(b.ward));

  let csvContent = 'data:text/csv;charset=utf-8,';
  
  // Headers
  const headers = [
    'Employee ID',
    'Employee Name',
    'Designation',
    'Ward / Department',
    'Shift',
    'Unit (A Shift Only)',
    'Weekly Off Day'
  ];
  
  csvContent += headers.join(',') + '\r\n';

  filtered.forEach((emp) => {
    const row = [
      emp.id,
      `"${emp.name.replace(/"/g, '""')}"`,
      `"${emp.designation.replace(/"/g, '""')}"`,
      `"${emp.ward.replace(/"/g, '""')}"`,
      emp.shift,
      emp.unit || '',
      emp.weekOff
    ];
    csvContent += row.join(',') + '\r\n';
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  
  const wardTag = selectedWard && selectedWard !== 'all' ? `_ward_${selectedWard.replace(/[^a-zA-Z0-9]/g, '_')}` : '_all_wards';
  const filename = `employee_roster${wardTag}_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function getCollarType(designation: string, id: string): 'white' | 'blue' {
  const blueKeywords = ['driver', 'helper', 'hmv', 'sweeper', 'loader', 'peon', 'gardener', 'cleaner', 'attendant', 'blue_collar', 'blue collar'];
  const normalized = (designation || '').toLowerCase();
  for (const kw of blueKeywords) {
    if (normalized.includes(kw)) {
      return 'blue';
    }
  }
  const numericId = parseInt(id, 10);
  if (!isNaN(numericId) && numericId < 1000) {
    return 'blue';
  }
  return 'white';
}
