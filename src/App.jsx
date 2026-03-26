import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Subjects from './components/Subjects'
import Notebooks from './components/Notebooks'
import TaskBoardandNotes from './components/TaskBoardandNotes'
import NotePage from './components/NotePage'
import BookChat from './components/BookChat'
import Settings from './components/Settings'

const Placeholder = ({ name }) => (
  <section className="w-full max-w-5xl bg-white/20 backdrop-blur-md rounded-[3rem] border border-white/40 shadow-2xl p-16 text-center">
    <h1 className="text-6xl font-serif text-stone-900 mb-4">{name}</h1>
    <p className="text-stone-700 italic font-serif">A section meant for your {name.toLowerCase()}. Still being bound by the leatherworker.</p>
  </section>
)

import { TimerProvider } from './context/TimerContext'

function App() {
  return (
    <TimerProvider>
      <div className="h-screen w-full bg-[url('/src/assets/white-parchment-paper.jpg')] bg-cover bg-no-repeat bg-center bg-fixed pl-[calc(17vw+4rem)] pr-6 py-6 transition-all duration-300 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-grow flex flex-col overflow-hidden transition-all duration-300">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notebooks" element={<Subjects />} />
            <Route path="/notebooks/:subjectId" element={<Notebooks />} />
            <Route path="/notebooks/:subjectId/:notebookId" element={<TaskBoardandNotes />} />
            <Route path="/notes/:noteId" element={<NotePage />} />
            <Route path="/shared" element={<Placeholder name="Shared" />} />
            <Route path="/trash" element={<Placeholder name="Trash" />} />
            <Route path="/chat" element={<BookChat />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <ToastContainer position="bottom-right" theme="light" autoClose={1000} pauseOnFocusLoss={false} />
      </div>
    </TimerProvider>
  )
}

export default App