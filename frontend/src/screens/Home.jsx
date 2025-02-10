import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/user.context';
import axios from '../config/axios'; // Uses the updated Axios instance
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user } = useContext(UserContext); // Logged-in user details
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [projectName, setProjectName] = useState(''); // Initialize with an empty string
  const [projects, setProjects] = useState([]); // Store projects

  const navigate = useNavigate();

  // Function to create a new project
  function createProject(e) {
    e.preventDefault();

    // Validate that the project name is not empty
    if (!projectName.trim()) {
      console.log("Project name is required");
      return;
    }

    // POST request to create the project; note that the token is attached via axios interceptor
    axios.post('/projects/create', {
      name: projectName.trim(),
      userId: user._id, // Ensure the backend receives the user's id if needed
    })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false); // Close modal on success
        setProjectName(''); // Reset input field
        fetchProjects(); // Refresh the project list
      })
      .catch((error) => {
        console.error("Error creating project:", error.response?.data || error.message);
      });
  }

  // Function to fetch all projects
  function fetchProjects() {
    axios.get('/projects/all')
      .then((res) => {
        setProjects(res.data.projects || []); // Set projects from the API response
      })
      .catch(err => {
        console.error("Error fetching projects:", err);
      });
  }

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <main className="p-4">
      <div className="projects flex flex-wrap gap-3">
        <button
          onClick={() => setIsModalOpen(true)} // Open modal to create a new project
          className="project p-4 border border-slate-300 rounded-md">
          New Project
          <i className="ri-link ml-2"></i>
        </button>

        {/* Render all fetched projects */}
        {projects.map((project) => (
          <div
            key={project._id}
            onClick={() => {
              navigate('/project', { state: { project } }); // Navigate to project details
            }}
            className="project flex flex-col gap-2 cursor-pointer p-4 border border-slate-300 rounded-md min-w-52 hover:bg-slate-200">
            <h2 className="font-semibold">{project.name}</h2>
            <div className="flex gap-2">
              <p>
                <small>
                  <i className="ri-user-line"></i> Collaborators
                </small>
                :
              </p>
              {project.users.length}
            </div>
          </div>
        ))}
      </div>

      {/* Modal to create a new project */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md w-1/3">
            <h2 className="text-xl mb-4">Create New Project</h2>
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  type="text"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                  onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
