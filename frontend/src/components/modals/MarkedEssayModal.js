  import React, { useState } from 'react';
import { XMarkIcon, DocumentTextIcon, AcademicCapIcon, SparklesIcon } from '@heroicons/react/24/outline';

const MarkedEssayModal = ({ isOpen, onClose, questionType = null }) => {
  const [selectedExample, setSelectedExample] = useState(0);

  // Sample marked essay data for different question types
  const markedEssays = {
    igcse_directed: [
      {
        id: 1,
        title: "Letter to School Principal",
        question: "Write a letter to your school principal suggesting improvements to the school library.",
        essay: `Dear Principal Johnson,

I am writing to suggest several improvements to our school library that would benefit all students and enhance our learning environment.

First, I believe we need to expand our digital resources. Many students prefer e-books and online databases, but our current collection is limited. Adding more e-books and subscribing to academic databases would help students with research projects and independent study.

Second, the library's seating area needs renovation. The current chairs are uncomfortable and the lighting is inadequate for long study sessions. Comfortable seating and better lighting would encourage students to spend more time studying in the library.

Third, I suggest extending the library hours, especially during exam periods. Many students would benefit from evening access to study in a quiet environment.

Finally, organizing regular workshops on research skills and digital literacy would help students make better use of the library's resources.

I hope you will consider these suggestions. I believe these improvements would significantly enhance our school's academic environment.

Yours sincerely,
Sarah Chen`,
        cambridgeMarks: {
          reading: "12/15",
          writing: "18/25",
          total: "30/40"
        },
        aiMarks: {
          reading: "12/15",
          writing: "19/25", 
          total: "31/40"
        },
        feedback: "Strong letter format with clear suggestions. Good use of formal language and appropriate register. Well-structured with logical progression of ideas."
      },
      {
        id: 2,
        title: "Speech to School Assembly",
        question: "Write a speech to be delivered at a school assembly about the importance of environmental conservation.",
        essay: `Good morning, students and teachers,

Today I want to talk about something that affects us all - our environment. Climate change is real, and we must act now to protect our planet for future generations.

Every day, we make choices that impact the environment. Simple actions like turning off lights, recycling paper, and using reusable water bottles can make a significant difference. We don't need to wait for governments or big corporations to act - we can start right here, right now.

Our school has already taken some positive steps. We have recycling bins in every classroom and solar panels on the roof. But we can do more. I propose we start a student-led environmental club to organize tree-planting activities and awareness campaigns.

Remember, we are the future. The decisions we make today will determine what kind of world we leave for our children. Let's work together to create a sustainable future.

Thank you for listening.`,
        cambridgeMarks: {
          reading: "11/15",
          writing: "16/25",
          total: "27/40"
        },
        aiMarks: {
          reading: "11/15",
          writing: "17/25",
          total: "28/40"
        },
        feedback: "Engaging speech with good audience awareness. Clear structure and appropriate tone. Some areas could benefit from more specific examples and stronger conclusion."
      }
    ],
    igcse_extended_q3: [
      {
        id: 1,
        title: "Journal Entry - Personal Experience",
        question: "Write a journal entry describing a challenging experience that taught you an important lesson.",
        essay: `March 15th, 2024

Today was one of the most difficult days of my life, but also one of the most important. I failed my driving test for the third time, and I felt completely defeated.

I had practiced for months, studied the rules, and felt confident. But when the examiner asked me to parallel park, my mind went blank. I panicked, made several mistakes, and failed the test again.

Walking home, I felt like giving up. Why keep trying when I clearly wasn't cut out for driving? But then I remembered what my grandmother always said: "Failure is not the opposite of success; it's a stepping stone to success."

I realized that each failure taught me something new. The first time, I learned about the importance of checking mirrors. The second time, I discovered I needed to practice more in different weather conditions. This time, I learned that I need to work on staying calm under pressure.

Instead of giving up, I'm going to book more practice sessions, work on my anxiety, and try again. This experience taught me that persistence and learning from mistakes are more valuable than immediate success.

I'm not giving up. I'm getting better.`,
        cambridgeMarks: {
          reading: "13/15",
          writing: "8/10",
          total: "21/25"
        },
        aiMarks: {
          reading: "13/15",
          writing: "8/10",
          total: "21/25"
        },
        feedback: "Excellent personal reflection with authentic voice. Good use of chronological structure and emotional development. Strong character voice and appropriate journal format."
      }
    ],
    igcse_summary: [
      {
        id: 1,
        title: "Summary of Climate Change Article",
        question: "Summarize the key points about climate change impacts on coastal cities.",
        essay: `Climate change poses significant threats to coastal cities worldwide. Rising sea levels, caused by melting ice caps and thermal expansion of oceans, threaten to flood low-lying areas. Many major cities, including New York, Miami, and Tokyo, face increased flooding risks.

Storm surges are becoming more frequent and intense due to warmer ocean temperatures. These events can cause billions of dollars in damage and displace millions of people. Coastal erosion is accelerating, destroying beaches and threatening infrastructure.

Cities are implementing various adaptation strategies. Some are building sea walls and flood barriers, while others are creating green infrastructure like wetlands and parks that can absorb floodwaters. Amsterdam and Venice serve as models for living with water through innovative engineering solutions.

However, adaptation alone is insufficient. Cities must also focus on reducing greenhouse gas emissions through renewable energy, public transportation, and energy-efficient buildings. The window for action is closing rapidly, and coastal cities must act now to protect their future.`,
        cambridgeMarks: {
          reading: "14/15",
          writing: "22/25",
          total: "36/40"
        },
        aiMarks: {
          reading: "14/15",
          writing: "23/25",
          total: "37/40"
        },
        feedback: "Comprehensive summary covering all key points. Well-organized with clear structure. Good use of own words while maintaining accuracy. Strong writing with varied sentence structures."
      }
    ],
    alevel_directed: [
      {
        id: 1,
        title: "Opinion Article on Social Media",
        question: "Write an opinion article for a newspaper discussing the impact of social media on teenage mental health.",
        essay: `The Digital Dilemma: Social Media's Impact on Teen Mental Health

In an age where teenagers spend an average of seven hours daily on social media, we must confront an uncomfortable truth: our digital obsession is reshaping young minds in ways we're only beginning to understand.

Social media platforms, designed to maximize engagement, exploit psychological vulnerabilities. The constant comparison with curated, filtered versions of others' lives creates a toxic environment where self-worth becomes tied to likes, comments, and followers. Studies consistently show correlations between heavy social media use and increased rates of anxiety, depression, and body image issues among teenagers.

However, the relationship isn't entirely negative. Social media provides unprecedented opportunities for connection, especially for marginalized youth who find communities and support online. During the pandemic, these platforms became lifelines for isolated teenagers, offering both entertainment and essential social interaction.

The solution lies not in demonizing technology but in promoting digital literacy and healthy usage patterns. Parents, educators, and policymakers must work together to teach teenagers how to navigate these platforms mindfully, recognizing both their potential and their pitfalls.

As we stand at this digital crossroads, we must choose: will we let social media shape our children, or will we shape how our children use social media?`,
        cambridgeMarks: {
          ao1: "4/5",
          ao2: "4/5",
          total: "8/10"
        },
        aiMarks: {
          ao1: "4/5",
          ao2: "5/5",
          total: "9/10"
        },
        feedback: "Sophisticated argument with balanced perspective. Excellent use of evidence and examples. Strong structure with clear introduction, development, and conclusion. Appropriate register for newspaper article."
      }
    ]
  };

  // Get examples for the selected question type or show all
  const getExamples = () => {
    if (questionType && markedEssays[questionType]) {
      return markedEssays[questionType];
    }
    // If no specific question type, show all examples
    return Object.values(markedEssays).flat();
  };

  const examples = getExamples();
  const currentExample = examples[selectedExample];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentTextIcon className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Marked Essay Examples</h2>
                <p className="text-blue-100">See how our AI compares to Cambridge examiners</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar - Example Selection */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Select Example</h3>
              <div className="space-y-2">
                {examples.map((example, index) => (
                  <button
                    key={example.id}
                    onClick={() => setSelectedExample(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedExample === index
                        ? 'bg-blue-100 border-2 border-blue-500 text-blue-900'
                        : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm">{example.title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Cambridge: {example.cambridgeMarks.total} | AI: {example.aiMarks.total}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {currentExample && (
              <div className="p-6 space-y-6">
                {/* Question */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Question</h3>
                  <p className="text-blue-800">{currentExample.question}</p>
                </div>

                {/* Marks Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cambridge Marks */}
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <AcademicCapIcon className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-red-900">Cambridge Examiner</h4>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(currentExample.cambridgeMarks).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-red-700 capitalize">{key}:</span>
                          <span className="font-semibold text-red-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Marks */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <SparklesIcon className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-900">Our AI</h4>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(currentExample.aiMarks).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-green-700 capitalize">{key}:</span>
                          <span className="font-semibold text-green-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">Sample Feedback</h4>
                  <p className="text-yellow-800">{currentExample.feedback}</p>
                </div>

                {/* Essay Content */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Student Response</h4>
                  <div className="bg-white rounded border p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                      {currentExample.essay}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              These examples show how our AI compares to Cambridge examiners. Results may vary.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkedEssayModal;
