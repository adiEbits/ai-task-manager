from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.services.ai_service import ai_service
from app.services.database import db_service
from app.middleware.auth import get_current_user
from app.utils.logger import logger

router = APIRouter(prefix="/api/ai", tags=["AI"])

# ==================== REQUEST/RESPONSE MODELS ====================

class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = "default"

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

class TaskSuggestionRequest(BaseModel):
    context: str = Field(..., min_length=1, max_length=500)

class TaskSuggestionResponse(BaseModel):
    suggestions: List[str]

class TaskEnhanceRequest(BaseModel):
    title: str
    description: str

class TaskEnhanceResponse(BaseModel):
    enhanced_description: str

class NLPTaskRequest(BaseModel):
    user_input: str = Field(..., min_length=1, max_length=500)

class NLPTaskResponse(BaseModel):
    parsed_task: Dict[str, Any]

class PrioritySuggestion(BaseModel):
    task_id: str
    title: str
    current_priority: str
    suggested_priority: str
    reason: Optional[str] = None

class DocumentRequest(BaseModel):
    doc_type: str = Field(..., description="Type: status_report, project_summary, achievement_report, task_list")
    custom_prompt: Optional[str] = None
    task_ids: Optional[List[str]] = None

class DocumentResponse(BaseModel):
    document: str
    doc_type: str

class AutomationAnalysis(BaseModel):
    type: str
    description: str
    suggestion: str
    tasks_affected: List[str]
    confidence: str

class AutomationResponse(BaseModel):
    automations: List[AutomationAnalysis]
    insights: List[str]

class SemanticSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)

class SemanticSearchResponse(BaseModel):
    results: List[Dict[str, Any]]
    total_found: int

class ReportRequest(BaseModel):
    report_type: str = Field(..., description="Type: productivity, time_analysis, achievement_summary")
    date_range: str = Field(default="all_time", description="all_time, this_week, this_month")

class ReportResponse(BaseModel):
    report: str
    report_type: str
class VoiceCommandRequest(BaseModel):
    voice_text: str = Field(..., min_length=1)

class VoiceCommandResponse(BaseModel):
    parsed_command: Dict[str, Any]
    
# ==================== HELP CENTER & CHATBOT ====================
@router.post("/voice/parse", response_model=VoiceCommandResponse)
async def parse_voice_command(
    request: VoiceCommandRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Parse voice command into structured task data
    
    Examples:
    - "Create a task to call John tomorrow"
    - "Add urgent task to fix the bug"
    - "Remind me to review the document"
    """
    try:
        parsed = await ai_service.parse_voice_command(request.voice_text)
        
        logger.info(f"Parsed voice command: {request.voice_text}")
        
        return VoiceCommandResponse(parsed_command=parsed)
        
    except Exception as e:
        logger.error(f"Voice parsing failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse voice command"
        )
        

@router.post("/help/chat", response_model=ChatResponse)
async def help_chatbot(
    request: ChatMessage,
    current_user: dict = Depends(get_current_user)
):
    """
    AI Help Center Chatbot - Get help about the application
    
    Ask questions like:
    - "How do I create a task?"
    - "What are the AI features?"
    - "Why aren't my tasks syncing?"
    - "How do I filter tasks?"
    """
    try:
        user_id = current_user["user_id"]
        
        response = await ai_service.help_chatbot(
            user_id=user_id,
            message=request.message,
            conversation_id=request.conversation_id
        )
        
        logger.info(f"Help chatbot query from {user_id}")
        
        return ChatResponse(
            response=response,
            conversation_id=request.conversation_id
        )
        
    except Exception as e:
        logger.error(f"Help chatbot failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get help response"
        )

# ==================== TASK COACH ====================

@router.post("/coach/chat", response_model=ChatResponse)
async def task_coach(
    request: ChatMessage,
    current_user: dict = Depends(get_current_user)
):
    """
    Personal Productivity Coach - Get personalized coaching
    
    Examples:
    - "I'm feeling overwhelmed with my tasks"
    - "How should I prioritize my work today?"
    - "I keep procrastinating on important tasks"
    - "What's the best way to stay motivated?"
    """
    try:
        user_id = current_user["user_id"]
        
        # Get user's tasks for context
        tasks = await db_service.query(
            table="tasks",
            filters={"auth_users_id": user_id},
            order_by="created_at.desc",
            limit=20
        )
        
        response = await ai_service.task_coach(
            user_id=user_id,
            message=request.message,
            tasks_context=tasks
        )
        
        logger.info(f"Task coach query from {user_id}")
        
        return ChatResponse(
            response=response,
            conversation_id=request.conversation_id
        )
        
    except Exception as e:
        logger.error(f"Task coach failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get coaching response"
        )

# ==================== NATURAL LANGUAGE PROCESSING ====================

@router.post("/nlp/parse-task", response_model=NLPTaskResponse)
async def parse_natural_language_task(
    request: NLPTaskRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Parse natural language into structured task
    
    Examples:
    - "Call John about the project tomorrow at 3pm"
    - "Buy groceries this weekend"
    - "Finish the urgent report by Friday"
    - "Schedule dentist appointment next week"
    """
    try:
        parsed = await ai_service.parse_natural_language_task(request.user_input)
        
        logger.info(f"Parsed NLP task: {parsed.get('title')}")
        
        return NLPTaskResponse(parsed_task=parsed)
        
    except Exception as e:
        logger.error(f"NLP parsing failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse task"
        )

# ==================== TASK SUGGESTIONS ====================

@router.post("/suggestions", response_model=TaskSuggestionResponse)
async def get_task_suggestions(
    request: TaskSuggestionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate AI task suggestions based on context
    
    Examples:
    - "Planning a wedding"
    - "Learning Python programming"
    - "Starting a podcast"
    - "Organizing a team offsite"
    """
    try:
        suggestions = await ai_service.generate_task_suggestions(request.context)
        
        if not suggestions:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service unavailable"
            )
        
        logger.info(f"Generated {len(suggestions)} task suggestions")
        
        return TaskSuggestionResponse(suggestions=suggestions)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Task suggestion failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate suggestions"
        )

# ==================== TASK ENHANCEMENT ====================

@router.post("/enhance", response_model=TaskEnhanceResponse)
async def enhance_task_description(
    request: TaskEnhanceRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Enhance task description with AI - add steps, details, considerations
    """
    try:
        enhanced = await ai_service.enhance_task_description(
            request.title,
            request.description
        )
        
        if not enhanced or enhanced == request.description:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service unavailable"
            )
        
        logger.info("Enhanced task description")
        
        return TaskEnhanceResponse(enhanced_description=enhanced)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Task enhancement failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to enhance description"
        )

# ==================== PRIORITY SUGGESTIONS ====================

@router.get("/prioritize", response_model=List[PrioritySuggestion])
async def get_priority_suggestions(
    current_user: dict = Depends(get_current_user)
):
    """
    Get AI-powered priority suggestions for all tasks
    """
    try:
        user_id = current_user["user_id"]
        
        tasks = await db_service.query(
            table="tasks",
            filters={"auth_users_id": user_id},
            limit=50
        )
        
        if not tasks:
            return []
        
        prioritized = await ai_service.prioritize_tasks(tasks)
        
        suggestions = [
            PrioritySuggestion(
                task_id=task["id"],
                title=task["title"],
                current_priority=task["priority"],
                suggested_priority=task.get("suggested_priority", task["priority"]),
                reason=task.get("priority_reason", None)
            )
            for task in prioritized
        ]
        
        logger.info(f"Generated priority suggestions for {len(suggestions)} tasks")
        
        return suggestions
        
    except Exception as e:
        logger.error(f"Priority suggestion failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate priority suggestions"
        )

# ==================== DOCUMENT GENERATION ====================

@router.post("/documents/generate", response_model=DocumentResponse)
async def generate_document(
    request: DocumentRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate professional documents from tasks
    
    Document types:
    - status_report: Weekly/monthly status update
    - project_summary: Overview of completed work
    - achievement_report: Highlight completed tasks
    - task_list: Formatted list for emails
    """
    try:
        user_id = current_user["user_id"]
        
        # Get tasks
        if request.task_ids:
            tasks = []
            for task_id in request.task_ids:
                task = await db_service.query(
                    table="tasks",
                    filters={"id": task_id, "auth_users_id": user_id}
                )
                if task:
                    tasks.extend(task)
        else:
            tasks = await db_service.query(
                table="tasks",
                filters={"auth_users_id": user_id},
                order_by="created_at.desc",
                limit=50
            )
        
        if not tasks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tasks found"
            )
        
        document = await ai_service.generate_document(
            doc_type=request.doc_type,
            tasks=tasks,
            custom_prompt=request.custom_prompt or ""
        )
        
        logger.info(f"Generated {request.doc_type} document")
        
        return DocumentResponse(
            document=document,
            doc_type=request.doc_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate document"
        )

# ==================== AUTOMATION ANALYSIS ====================

@router.get("/automations/analyze", response_model=AutomationResponse)
async def analyze_automations(
    current_user: dict = Depends(get_current_user)
):
    """
    Analyze tasks and suggest intelligent automations
    
    Detects:
    - Recurring patterns
    - Auto-categorization opportunities
    - Duplicate tasks
    - Task dependencies
    """
    try:
        user_id = current_user["user_id"]
        
        tasks = await db_service.query(
            table="tasks",
            filters={"auth_users_id": user_id},
            order_by="created_at.desc",
            limit=100
        )
        
        if not tasks:
            return AutomationResponse(automations=[], insights=[])
        
        analysis = await ai_service.analyze_automations(tasks)
        
        automations = [
            AutomationAnalysis(**auto)
            for auto in analysis.get("automations", [])
        ]
        
        logger.info(f"Found {len(automations)} automation opportunities")
        
        return AutomationResponse(
            automations=automations,
            insights=analysis.get("insights", [])
        )
        
    except Exception as e:
        logger.error(f"Automation analysis failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze automations"
        )

# ==================== SEMANTIC SEARCH ====================

@router.post("/search/semantic", response_model=SemanticSearchResponse)
async def semantic_search(
    request: SemanticSearchRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Intelligent semantic search - understands intent and context
    
    Examples:
    - "urgent work items"
    - "things to call about"
    - "what's due this week"
    - "tasks for john"
    """
    try:
        user_id = current_user["user_id"]
        
        tasks = await db_service.query(
            table="tasks",
            filters={"auth_users_id": user_id},
            limit=100
        )
        
        if not tasks:
            return SemanticSearchResponse(results=[], total_found=0)
        
        results = await ai_service.semantic_search(request.query, tasks)
        
        logger.info(f"Semantic search found {len(results)} results")
        
        return SemanticSearchResponse(
            results=results,
            total_found=len(results)
        )
        
    except Exception as e:
        logger.error(f"Semantic search failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform search"
        )

# ==================== REPORTS ====================

@router.post("/reports/generate", response_model=ReportResponse)
async def generate_report(
    request: ReportRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate analytical reports
    
    Report types:
    - productivity: Completion rates, trends, patterns
    - time_analysis: Time allocation analysis
    - achievement_summary: What's been accomplished
    """
    try:
        user_id = current_user["user_id"]
        
        tasks = await db_service.query(
            table="tasks",
            filters={"auth_users_id": user_id},
            order_by="created_at.desc",
            limit=200
        )
        
        if not tasks:
            return ReportResponse(
                report="No tasks available for report generation.",
                report_type=request.report_type
            )
        
        report = await ai_service.generate_report(
            report_type=request.report_type,
            tasks=tasks,
            date_range=request.date_range
        )
        
        logger.info(f"Generated {request.report_type} report")
        
        return ReportResponse(
            report=report,
            report_type=request.report_type
        )
        
    except Exception as e:
        logger.error(f"Report generation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate report"
        )