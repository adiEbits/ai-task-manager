import anthropic
from app.config import settings
from app.utils.logger import logger
from typing import Optional, List, Dict, Tuple, Any
import json
from datetime import datetime, timedelta
import re

class AIService:
    def __init__(self):
        if settings.ANTHROPIC_API_KEY:
            self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            self.conversation_history = {}  # Store per-user chat history
        else:
            self.client = None
            logger.warning("Anthropic API key not set - AI features disabled")
    
    # ==================== SYSTEM PROMPTS ====================
    
    AUTO_COMPLETE_SYSTEM = """You are an AI auto-completion assistant for task management.

Given partial task text, suggest 3-5 intelligent completions based on:
1. Context and common task patterns
2. Professional task naming conventions
3. Industry best practices
4. Action-oriented language

**Rules:**
- Completions should be concise (5-10 words)
- Start with action verbs when possible
- Be specific and actionable
- Consider common workflows
- Avoid generic suggestions

**Response Format:**
Return JSON array of suggestions:
["Completion 1", "Completion 2", "Completion 3"]

Be helpful and predictive."""

    EMAIL_GENERATOR_SYSTEM = """You are a professional email writing assistant.

Generate professional emails based on task information for:
1. **Status Updates**: Inform stakeholders of progress
2. **Task Assignments**: Delegate work professionally
3. **Meeting Requests**: Schedule discussions
4. **Follow-ups**: Polite reminders
5. **Completions**: Announce task completion

**Writing Style:**
- Professional but friendly
- Clear and concise
- Action-oriented
- Include relevant context
- Appropriate tone for context

**Email Structure:**
Subject: [Clear, specific subject line]

Hi [Recipient],

[Opening]
[Body with context]
[Call to action]
[Closing]

Best regards,
[Sender]

Keep emails under 150 words unless context requires more."""

    DEPENDENCY_ANALYZER_SYSTEM = """You are a project management expert specializing in task dependencies and critical path analysis.

Analyze tasks to identify:
1. **Dependencies**: Which tasks must complete before others
2. **Blockers**: Tasks blocking progress
3. **Critical Path**: Sequence of critical tasks
4. **Parallel Opportunities**: Tasks that can run simultaneously
5. **Risk Assessment**: Potential bottlenecks

**Analysis Criteria:**
- Logical sequence requirements
- Resource dependencies
- Time dependencies
- Technical prerequisites
- Domain knowledge

**Response Format:**
{
  "dependencies": [
    {
      "task_id": "uuid",
      "depends_on": ["uuid1", "uuid2"],
      "reason": "Why dependency exists",
      "type": "hard/soft",
      "blocks": ["uuid3"]
    }
  ],
  "critical_path": ["uuid1", "uuid2", "uuid3"],
  "parallel_groups": [["uuid4", "uuid5"], ["uuid6", "uuid7"]],
  "bottlenecks": [
    {
      "task_id": "uuid",
      "reason": "Why it's a bottleneck",
      "recommendation": "How to resolve"
    }
  ],
  "estimated_timeline": {
    "optimistic_days": 10,
    "realistic_days": 15,
    "pessimistic_days": 20
  }
}"""

    SENTIMENT_URGENCY_SYSTEM = """You are an AI expert in sentiment analysis and urgency detection for task management.

Analyze task titles and descriptions for:
1. **Urgency Level**: immediate/high/medium/low
2. **Sentiment**: stressed/neutral/positive
3. **Workload Indicator**: overwhelming/heavy/moderate/light
4. **Risk Factors**: deadline pressure, complexity, dependencies

**Urgency Indicators:**
- Time-sensitive words: ASAP, urgent, deadline, critical
- Action intensity: must, need, required, essential
- Consequences: blocking, preventing, urgent issue

**Sentiment Indicators:**
- Stress: overwhelmed, struggling, difficult, too many
- Neutral: standard, regular, normal
- Positive: excited, opportunity, improvement

**Response Format:**
{
  "urgency_level": "immediate/high/medium/low",
  "urgency_score": 0.0-1.0,
  "sentiment": "stressed/neutral/positive",
  "workload_indicator": "overwhelming/heavy/moderate/light",
  "recommended_priority": "urgent/high/medium/low",
  "reasoning": "Why this assessment",
  "suggestions": ["Action 1", "Action 2"]
}"""

    MEETING_NOTES_EXTRACTOR = """You are an AI assistant that extracts actionable tasks from meeting notes and conversations.

Extract:
1. **Action Items**: Specific tasks mentioned
2. **Assignments**: Who is responsible
3. **Deadlines**: When tasks are due
4. **Context**: Why tasks are needed
5. **Priority**: Importance level

**Extraction Rules:**
- Look for action verbs: will, need to, should, must, going to
- Identify owners: names mentioned with tasks
- Find dates: specific dates, "by end of week", "next Monday"
- Determine priority from context and language
- Group related action items

**Response Format:**
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Context and details",
      "assigned_to": "Person name or null",
      "due_date": "2025-12-25 or null",
      "priority": "high/medium/low",
      "category": "Suggested category",
      "source_quote": "Original text from notes"
    }
  ],
  "summary": "Brief meeting summary",
  "follow_up_needed": ["Item 1", "Item 2"]
}"""

    BULK_OPERATIONS_SYSTEM = """You are an AI assistant for intelligent bulk task operations.

Analyze multiple tasks and suggest:
1. **Categorization**: Group by theme/domain
2. **Priority Alignment**: Consistent priority levels
3. **Smart Tags**: Common themes and keywords
4. **Duplicate Detection**: Similar or redundant tasks
5. **Consolidation Opportunities**: Tasks that can be merged

**Analysis Approach:**
- Identify patterns across tasks
- Consider semantic similarity
- Respect existing categorization when sensible
- Suggest improvements, not complete overhauls
- Maintain task identity

**Response Format:**
{
  "categorization": {
    "task_id": "suggested_category"
  },
  "prioritization": {
    "task_id": {
      "suggested_priority": "high/medium/low",
      "reason": "Why"
    }
  },
  "tagging": {
    "task_id": ["tag1", "tag2", "tag3"]
  },
  "duplicates": [
    {
      "task_ids": ["uuid1", "uuid2"],
      "similarity_score": 0.95,
      "suggestion": "Keep/merge/review"
    }
  ],
  "consolidation": [
    {
      "task_ids": ["uuid1", "uuid2", "uuid3"],
      "suggested_title": "Consolidated task title",
      "reason": "Why consolidate"
    }
  ]
}"""

    PREDICTIVE_ANALYTICS_SYSTEM = """You are a data scientist specializing in task completion prediction and workload forecasting.

Analyze task data to predict:
1. **Completion Time**: Estimated hours/days
2. **Bottleneck Risk**: Probability of delays
3. **Workload Balance**: Current capacity utilization
4. **Completion Probability**: Likelihood of on-time completion
5. **Resource Needs**: Additional resources required

**Prediction Factors:**
- Task complexity and description length
- Historical completion patterns
- Current workload
- Priority and dependencies
- Category and type

**Response Format:**
{
  "predictions": [
    {
      "task_id": "uuid",
      "estimated_hours": 4.5,
      "confidence": 0.85,
      "completion_date": "2025-12-25",
      "bottleneck_risk": "low/medium/high",
      "factors": ["Factor 1", "Factor 2"]
    }
  ],
  "workload_forecast": {
    "current_capacity": 75.0,
    "projected_capacity_next_week": 85.0,
    "overload_risk": "low/medium/high",
    "recommendations": ["Suggestion 1", "Suggestion 2"]
  },
  "insights": [
    "Insight 1",
    "Insight 2"
  ]
}"""

    VOICE_COMMAND_SYSTEM = """You are a voice command interpreter for task management.

Parse voice commands to extract intent and parameters:
1. **Action**: create, update, delete, list, search, complete
2. **Target**: task, category, priority, status
3. **Parameters**: titles, dates, priorities, filters
4. **Context**: Additional information

**Voice Command Examples:**
"Create a task to call John tomorrow"
"Mark the project presentation as complete"
"Show me all urgent tasks"
"Change the priority of meeting prep to high"
"Delete the grocery shopping task"

**Response Format:**
{
  "action": "create/update/delete/list/search/complete",
  "target": "task/filter/status",
  "parameters": {
    "title": "Task title",
    "priority": "high/medium/low",
    "due_date": "2025-12-25",
    "status": "todo/in_progress/completed",
    "search_query": "search terms"
  },
  "confidence": 0.95,
  "clarification_needed": false,
  "clarification_question": "Question if confidence < 0.7"
}"""

    WORKFLOW_TEMPLATE_SYSTEM = """You are an expert in creating structured workflows and task templates for various industries and use cases.

Generate comprehensive task workflows for:
1. **Industry Standards**: Software dev, marketing, sales, etc.
2. **Common Processes**: Onboarding, launches, planning
3. **Best Practices**: Proven methodologies
4. **Customizable**: Adaptable to specific needs

**Template Structure:**
- Logical task sequence
- Realistic time estimates
- Proper prioritization
- Clear dependencies
- Milestone markers
- Success criteria

**Response Format:**
{
  "template_name": "Template name",
  "description": "What this workflow accomplishes",
  "industry": "Industry type",
  "estimated_duration": "X weeks/days",
  "tasks": [
    {
      "order": 1,
      "title": "Task title",
      "description": "Detailed description",
      "priority": "high/medium/low",
      "estimated_hours": 4,
      "category": "Category",
      "tags": ["tag1", "tag2"],
      "depends_on": [0],
      "milestone": true/false,
      "success_criteria": "How to know it's done"
    }
  ],
  "tips": ["Tip 1", "Tip 2"],
  "common_pitfalls": ["Pitfall 1", "Pitfall 2"]
}"""

    TASK_SUGGESTION_PROMPT = """You are an expert productivity assistant. Given a user's context or goal, suggest 5 specific, actionable tasks.

Rules:
- Each task should be clear and achievable
- Start each task with an action verb
- Keep tasks concise (under 60 characters)
- Make tasks specific, not vague
- Order by logical sequence or priority

Format: Return ONLY a numbered list, no additional text."""

    DESCRIPTION_ENHANCEMENT_PROMPT = """You are a task management expert. Enhance the given task description to make it more detailed and actionable.

Rules:
- Add specific steps or subtasks
- Include relevant considerations
- Keep it concise but comprehensive
- Use bullet points for steps
- Add estimated time if relevant

Format:
**Overview:** Brief summary
**Steps:**
- Step 1
- Step 2
- Step 3

**Considerations:** Key points
**Estimated Time:** X hours/days"""

    # ==================== AI METHODS ====================
    
    async def auto_complete(self, partial_text: str, context: str = "") -> List[str]:
        """AI auto-completion for task titles"""
        if not self.client or not partial_text:
            return []
        
        try:
            prompt = f"Partial task text: {partial_text}"
            if context:
                prompt += f"\nContext: {context}"
            prompt += "\n\nSuggest completions:"
            
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=300,
                system=self.AUTO_COMPLETE_SYSTEM,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = response.content[0].text.strip()
            
            # Parse JSON array
            if '[' in response_text and ']' in response_text:
                json_start = response_text.index('[')
                json_end = response_text.rindex(']') + 1
                completions = json.loads(response_text[json_start:json_end])
                return completions[:5]
            
            return []
            
        except Exception as e:
            logger.error(f"Auto-complete error: {str(e)}")
            return []
    
    async def generate_email(self, task: Dict, email_type: str, recipient: str = "") -> str:
        """Generate professional email from task"""
        if not self.client:
            return "Email generation unavailable."
        
        try:
            task_info = f"Task: {task.get('title')}\n"
            task_info += f"Status: {task.get('status')}\n"
            task_info += f"Priority: {task.get('priority')}\n"
            if task.get('description'):
                task_info += f"Description: {task.get('description')}\n"
            
            prompt = f"Email type: {email_type}\n"
            if recipient:
                prompt += f"Recipient: {recipient}\n"
            prompt += f"\n{task_info}\n\nGenerate professional email:"
            
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=500,
                system=self.EMAIL_GENERATOR_SYSTEM,
                messages=[{"role": "user", "content": prompt}]
            )
            
            return response.content[0].text.strip()
            
        except Exception as e:
            logger.error(f"Email generation error: {str(e)}")
            return "Failed to generate email."
    
    async def analyze_dependencies(self, tasks: List[Dict]) -> Dict:
        """Analyze task dependencies and critical path"""
        if not self.client or not tasks:
            return {}
        
        try:
            task_data = json.dumps([{
                "id": t.get("id"),
                "title": t.get("title"),
                "description": t.get("description", ""),
                "status": t.get("status"),
                "priority": t.get("priority")
            } for t in tasks], indent=2)
            
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                system=self.DEPENDENCY_ANALYZER_SYSTEM,
                messages=[{
                    "role": "user",
                    "content": f"Analyze dependencies:\n\n{task_data}"
                }]
            )
            
            response_text = response.content[0].text.strip()
            
            # Parse JSON
            if '{' in response_text and '}' in response_text:
                json_start = response_text.index('{')
                json_end = response_text.rindex('}') + 1
                return json.loads(response_text[json_start:json_end])
            
            return {}
            
        except Exception as e:
            logger.error(f"Dependency analysis error: {str(e)}")
            return {}
    
    async def detect_sentiment_urgency(self, title: str, description: str = "") -> Dict:
        """Detect sentiment and urgency from task"""
        if not self.client:
            return {}
        
        try:
            text = f"Title: {title}\n"
            if description:
                text += f"Description: {description}"
            
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=400,
                system=self.SENTIMENT_URGENCY_SYSTEM,
                messages=[{
                    "role": "user",
                    "content": f"Analyze:\n\n{text}"
                }]
            )
            
            response_text = response.content[0].text.strip()
            
            # Parse JSON
            if '{' in response_text and '}' in response_text:
                json_start = response_text.index('{')
                json_end = response_text.rindex('}') + 1
                return json.loads(response_text[json_start:json_end])
            
            return {}
            
        except Exception as e:
            logger.error(f"Sentiment detection error: {str(e)}")
            return {}
    
    async def extract_tasks_from_notes(self, notes: str) -> Dict:
        """Extract tasks from meeting notes"""
        if not self.client:
            return {"tasks": [], "summary": ""}
        
        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1500,
                system=self.MEETING_NOTES_EXTRACTOR,
                messages=[{
                    "role": "user",
                    "content": f"Meeting notes:\n\n{notes}\n\nExtract tasks:"
                }]
            )
            
            response_text = response.content[0].text.strip()
            
            # Parse JSON
            if '{' in response_text and '}' in response_text:
                json_start = response_text.index('{')
                json_end = response_text.rindex('}') + 1
                return json.loads(response_text[json_start:json_end])
            
            return {"tasks": [], "summary": ""}
            
        except Exception as e:
            logger.error(f"Notes extraction error: {str(e)}")
            return {"tasks": [], "summary": ""}
    
    async def bulk_operations_suggest(self, tasks: List[Dict]) -> Dict:
        """Suggest bulk operations for tasks"""
        if not self.client or not tasks:
            return {}
        
        try:
            task_data = json.dumps([{
                "id": t.get("id"),
                "title": t.get("title"),
                "category": t.get("category"),
                "priority": t.get("priority"),
                "tags": t.get("tags", [])
            } for t in tasks], indent=2)
            
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                system=self.BULK_OPERATIONS_SYSTEM,
                messages=[{
                    "role": "user",
                    "content": f"Analyze for bulk operations:\n\n{task_data}"
                }]
            )
            
            response_text = response.content[0].text.strip()
            
            # Parse JSON
            if '{' in response_text and '}' in response_text:
                json_start = response_text.index('{')
                json_end = response_text.rindex('}') + 1
                return json.loads(response_text[json_start:json_end])
            
            return {}
            
        except Exception as e:
            logger.error(f"Bulk operations error: {str(e)}")
            return {}
    
    async def predict_analytics(self, tasks: List[Dict]) -> Dict:
        """Predictive analytics for tasks"""
        if not self.client or not tasks:
            return {}
        
        try:
            task_data = json.dumps([{
                "id": t.get("id"),
                "title": t.get("title"),
                "status": t.get("status"),
                "priority": t.get("priority"),
                "created_at": t.get("created_at")
            } for t in tasks], indent=2)
            
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1500,
                system=self.PREDICTIVE_ANALYTICS_SYSTEM,
                messages=[{
                    "role": "user",
                    "content": f"Predict analytics:\n\n{task_data}"
                }]
            )
            
            response_text = response.content[0].text.strip()
            
            # Parse JSON
            if '{' in response_text and '}' in response_text:
                json_start = response_text.index('{')
                json_end = response_text.rindex('}') + 1
                return json.loads(response_text[json_start:json_end])
            
            return {}
            
        except Exception as e:
            logger.error(f"Predictive analytics error: {str(e)}")
            return {}
    
    async def parse_voice_command(self, voice_text: str) -> Dict:
        """Parse voice command"""
        if not self.client:
            return {}
        
        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=400,
                system=self.VOICE_COMMAND_SYSTEM,
                messages=[{
                    "role": "user",
                    "content": f"Voice command: {voice_text}\n\nParse command:"
                }]
            )
            
            response_text = response.content[0].text.strip()
            
            # Parse JSON
            if '{' in response_text and '}' in response_text:
                json_start = response_text.index('{')
                json_end = response_text.rindex('}') + 1
                return json.loads(response_text[json_start:json_end])
            
            return {}
            
        except Exception as e:
            logger.error(f"Voice parsing error: {str(e)}")
            return {}
    
    async def generate_workflow_template(self, workflow_type: str, customization: str = "") -> Dict:
        """Generate workflow template"""
        if not self.client:
            return {}
        
        try:
            prompt = f"Workflow type: {workflow_type}"
            if customization:
                prompt += f"\nCustomization: {customization}"
            prompt += "\n\nGenerate template:"
            
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2500,
                system=self.WORKFLOW_TEMPLATE_SYSTEM,
                messages=[{"role": "user", "content": prompt}]
            )
            
            response_text = response.content[0].text.strip()
            
            # Parse JSON
            if '{' in response_text and '}' in response_text:
                json_start = response_text.index('{')
                json_end = response_text.rindex('}') + 1
                return json.loads(response_text[json_start:json_end])
            
            return {}
            
        except Exception as e:
            logger.error(f"Template generation error: {str(e)}")
            return {}
    
    async def generate_task_suggestions(self, context: str) -> List[str]:
        """Generate task suggestions based on context"""
        if not self.client:
            return []
        
        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                system=self.TASK_SUGGESTION_PROMPT,
                messages=[{
                    "role": "user",
                    "content": f"Context/Goal: {context}\n\nGenerate 5 actionable tasks:"
                }]
            )
            
            suggestions = message.content[0].text.strip().split('\n')
            cleaned = [s.strip() for s in suggestions if s.strip() and any(c.isalnum() for c in s)]
            
            logger.info(f"Generated {len(cleaned)} task suggestions")
            return cleaned[:5]
            
        except Exception as e:
            logger.error(f"AI suggestion error: {str(e)}")
            return []
    
    async def enhance_task_description(self, title: str, brief_description: str) -> str:
        """Enhance task description with detailed steps"""
        if not self.client:
            return brief_description
        
        try:
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=800,
                system=self.DESCRIPTION_ENHANCEMENT_PROMPT,
                messages=[{
                    "role": "user",
                    "content": f"Task Title: {title}\nCurrent Description: {brief_description or 'No description provided'}\n\nEnhance this task description:"
                }]
            )
            
            enhanced = message.content[0].text.strip()
            logger.info(f"Enhanced description for task: {title}")
            return enhanced
            
        except Exception as e:
            logger.error(f"AI enhancement error: {str(e)}")
            return brief_description
    
    async def prioritize_tasks(self, tasks: List[Dict]) -> List[Dict]:
        """AI-powered task prioritization"""
        if not self.client or not tasks:
            return tasks
        
        try:
            task_list = "\n".join([
                f"{i+1}. {t['title']}: {t.get('description', 'No description')}"
                for i, t in enumerate(tasks)
            ])
            
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1500,
                system="Analyze tasks and suggest priorities. Return JSON with task priorities.",
                messages=[{
                    "role": "user",
                    "content": f"Tasks:\n{task_list}\n\nSuggest priorities:"
                }]
            )
            
            response_text = message.content[0].text.strip()
            
            for i, task in enumerate(tasks):
                if i < len(tasks):
                    tasks[i]['suggested_priority'] = task.get('priority', 'medium')
            
            return tasks
            
        except Exception as e:
            logger.error(f"AI prioritization error: {str(e)}")
            return tasks
    
    async def parse_natural_language_task(self, user_input: str) -> Dict:
        """Parse natural language into structured task"""
        if not self.client:
            return {"title": user_input, "priority": "medium"}
        
        try:
            current_date = datetime.now().isoformat()
            
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=500,
                system="""Extract task info from natural language. Return JSON:
{
  "title": "Task title",
  "description": "Details",
  "priority": "low/medium/high/urgent",
  "due_date": "ISO date or null",
  "category": "Work/Personal/etc",
  "tags": ["tag1", "tag2"]
}""",
                messages=[{
                    "role": "user",
                    "content": f"Current date: {current_date}\n\nUser input: {user_input}\n\nExtract task info:"
                }]
            )
            
            response_text = response.content[0].text.strip()
            
            if '{' in response_text and '}' in response_text:
                json_start = response_text.index('{')
                json_end = response_text.rindex('}') + 1
                task_data = json.loads(response_text[json_start:json_end])
                
                logger.info(f"Parsed NLP task: {task_data}")
                return task_data
            
            return {"title": user_input, "priority": "medium"}
            
        except Exception as e:
            logger.error(f"NLP parsing error: {str(e)}")
            return {"title": user_input, "priority": "medium"}

ai_service = AIService()