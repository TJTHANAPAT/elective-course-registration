import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Homepage from './Homepage';
import Dashboard from './CourseDashboard';
import Enroll from './Enroll';
import GetStudentData from './GetStudentData';

import Admin from './admin/Admin';
import SystemManagement from './admin/SystemManagement';
import CourseYearConfig from './admin/CourseYearConfig';
import GradeConfig from './admin/GradeConfig';
import CreateCourse from './admin/CreateCourse';
import EditCourse from './admin/EditCourse';
import ViewCourse from './admin/ViewCourse';
import Register from './admin/Register';
import Settings from './admin/Settings';
import ManageStudent from './admin/ManageStudent';

function App() {
  return (
    <Router>
      <Switch>
        <Route path='/search/'>
          <GetStudentData />
        </Route>
        <Route path='/course/enroll'>
          <Enroll />
        </Route>
        <Route path='/course'>
          <Dashboard />
        </Route>
        <Route path='/admin/createcourse'>
          <CreateCourse />
        </Route>
        <Route path='/admin/viewcourse'>
          <ViewCourse />
        </Route>
        <Route path='/admin/editcourse'>
          <EditCourse />
        </Route>
        <Route path='/admin/system/config/year'>
          <CourseYearConfig />
        </Route>
        <Route path='/admin/config/grade'>
          <GradeConfig />
        </Route>
        <Route path='/admin/settings'>
          <Settings />
        </Route>
        <Route path='/admin/course'>
          <SystemManagement />
        </Route>
        <Route path='/admin/managestudent'>
          <ManageStudent />
        </Route>
        <Route path='/admin'>
          <Admin />
        </Route>
        <Route path='/register'>
          <Register />
        </Route>
        <Route path='/'>
          <Homepage />
        </Route>
      </Switch>
    </Router>

  );
}

export default App;
