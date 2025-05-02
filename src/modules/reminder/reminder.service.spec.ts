import { Test, TestingModule } from '@nestjs/testing';
import { ReminderService } from './reminder.service';
import { UserService } from '../user/user.service';
import { FeedbackService } from '../feedback/feedback.service';
import { NotificationService } from '../notification/notification.service';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';
import { User } from '../user/entities/user.entity';

describe('ReminderService', () => {
  let service: ReminderService;
  
  const mockUserService = {
    getActiveUsers: jest.fn(),
  };
  
  const mockFeedbackService = {
    findUserRecentFeedback: jest.fn(),
  };
  
  const mockNotificationService = {
    createFeedbackReminder: jest.fn(),
  };
  
  const mockConfigService = {
    get: jest.fn(),
  };
  
  const mockSchedulerRegistry = {
    addCronJob: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReminderService,
        { provide: UserService, useValue: mockUserService },
        { provide: FeedbackService, useValue: mockFeedbackService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: SchedulerRegistry, useValue: mockSchedulerRegistry },
      ],
    }).compile();

    service = module.get<ReminderService>(ReminderService);
    
    // Mock logger to prevent console output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFeedbackReminders', () => {
    it('should create reminders successfully', async () => {

      const mockUsers = [
        { id: '35240617-541a-4124-b68e-fffa3ff62b95', email: 'user1@email.com' },
        { id: '86483ad9-a0aa-48eb-8c10-113bf2e5378e', email: 'user2@email.com' },
      ] as User[];
      
      mockConfigService.get.mockReturnValue(7);
      mockUserService.getActiveUsers.mockResolvedValue(mockUsers);
      
      // user1 doesn't have recent feedback, user2 has recent feedback
      mockFeedbackService.findUserRecentFeedback.mockImplementation((userId) => {
        return Promise.resolve(userId === '86483ad9-a0aa-48eb-8c10-113bf2e5378e' ? { id: '0a9409a0-fd6b-4005-bb95-bb1791e998da' } : null);
      });
      
      mockNotificationService.createFeedbackReminder.mockResolvedValue({});
      
      // Act
      await service.createFeedbackReminders();
      
      // Assert
      expect(mockUserService.getActiveUsers).toHaveBeenCalled();
      expect(mockFeedbackService.findUserRecentFeedback).toHaveBeenCalledTimes(2);
      
      // Only user1 should get a reminder
      expect(mockNotificationService.createFeedbackReminder).toHaveBeenCalledTimes(1);
      expect(mockNotificationService.createFeedbackReminder).toHaveBeenCalledWith('35240617-541a-4124-b68e-fffa3ff62b95');
    });
    
    it('should handle errors when creating reminders', async () => {
      const mockUsers = [{ id: '35240617-541a-4124-b68e-fffa3ff62b95', email: 'user1@email.com' }] as User[];
      
      mockConfigService.get.mockReturnValue(7);
      mockUserService.getActiveUsers.mockResolvedValue(mockUsers);
      mockFeedbackService.findUserRecentFeedback.mockResolvedValue(null);
      
      // Simulate error
      mockNotificationService.createFeedbackReminder.mockRejectedValue(new Error('Test error'));
      
      // Act
      await service.createFeedbackReminders();
      
      // Assert - should not throw, error should be logged
      expect(mockNotificationService.createFeedbackReminder).toHaveBeenCalledWith('35240617-541a-4124-b68e-fffa3ff62b95');
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });
});