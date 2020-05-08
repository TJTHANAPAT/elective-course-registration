import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import Dashboard from './CourseDashboard';
import Enroll from './Enroll';
import GetStudentData from './GetStudentData';
import Homepage from './Homepage';

import Admin from './admin/Admin';
import CourseManagement from './admin/CourseManagement';
import CourseYearConfig from './admin/CourseYearConfig';
import GradeConfig from './admin/GradeConfig';
import CreateCourse from './admin/CreateCourse';
import EditCourse from './admin/EditCourse';
import ViewCourse from './admin/ViewCourse';


function App() {
  return (
    <Router>
      <Switch>
        <Route path='/search/'>
          <GetStudentData/>
        </Route>
        <Route path='/course/enroll'>
          <Enroll/>
        </Route>
        <Route path='/course'>
          <Dashboard/>
        </Route>
        <Route path='/admin/createcourse'>
          <CreateCourse/>
        </Route>
        <Route path='/admin/viewcourse'>
          <ViewCourse/>
        </Route>
        <Route path='/admin/editcourse'>
          <EditCourse/>
        </Route>
        <Route path='/admin/system/config/year'>
          <CourseYearConfig/>
        </Route>
        <Route path='/admin/config/grade'>
          <GradeConfig/>
        </Route>
        <Route path='/admin/course'>
          <CourseManagement/>
        </Route>
        <Route path='/admin'>
          <Admin/>
        </Route>
        <Route path='/'>
          <Homepage/>
        </Route>
      </Switch>
    </Router>
    
  );
}

export default App;
