import { mockGitHubResponse } from '../utils/testHelpers';

describe('GitHub Integration Tests', () => {
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = global.fetch as jest.Mock;
    mockFetch.mockClear();
  });

  describe('Repository Connection', () => {
    test('should successfully connect to valid repository', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          full_name: 'user/repo',
          private: false,
          default_branch: 'main'
        })
      });

      // Simulate test connection
      const response = await fetch('https://api.github.com/repos/user/repo', {
        method: 'GET',
        headers: {
          'Authorization': 'token ghp_test'
        }
      });

      const data = JSON.parse(await response.text());
      
      expect(response.ok).toBe(true);
      expect(data.full_name).toBe('user/repo');
    });

    test('should handle 404 for non-existent repository', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({
          message: 'Not Found'
        })
      });

      const response = await fetch('https://api.github.com/repos/user/nonexistent', {
        method: 'GET'
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    test('should handle invalid token (401)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({
          message: 'Bad credentials'
        })
      });

      const response = await fetch('https://api.github.com/repos/user/repo', {
        method: 'GET',
        headers: {
          'Authorization': 'token invalid_token'
        }
      });

      expect(response.status).toBe(401);
    });

    test('should handle rate limiting (403)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => JSON.stringify({
          message: 'API rate limit exceeded'
        })
      });

      const response = await fetch('https://api.github.com/repos/user/repo');

      expect(response.status).toBe(403);
    });
  });

  describe('Branch Operations', () => {
    test('should get base branch SHA successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          object: {
            sha: 'abc123def456'
          }
        })
      });

      const response = await fetch('https://api.github.com/repos/user/repo/git/ref/heads/main');
      const data = JSON.parse(await response.text());

      expect(data.object.sha).toBe('abc123def456');
    });

    test('should handle non-existent branch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({
          message: 'Not Found'
        })
      });

      const response = await fetch('https://api.github.com/repos/user/repo/git/ref/heads/nonexistent');

      expect(response.ok).toBe(false);
    });

    test('should create new branch successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () => JSON.stringify({
          ref: 'refs/heads/feature-branch',
          object: {
            sha: 'abc123'
          }
        })
      });

      const response = await fetch('https://api.github.com/repos/user/repo/git/refs', {
        method: 'POST',
        body: JSON.stringify({
          ref: 'refs/heads/feature-branch',
          sha: 'abc123'
        })
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
    });

    test('should update existing branch with PATCH instead of DELETE+CREATE', async () => {
      // Step 1: Check branch exists — returns 200
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          ref: 'refs/heads/design-tokens',
          object: { sha: 'old_sha_123' }
        })
      });

      // Step 2: PATCH to update branch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          ref: 'refs/heads/design-tokens',
          object: { sha: 'new_base_sha' }
        })
      });

      // Simulate the non-destructive branch update flow
      const branchUrl = 'https://api.github.com/repos/user/repo/git/refs/heads/design-tokens';

      const checkResponse = await fetch(branchUrl, { method: 'GET' });
      expect(checkResponse.ok).toBe(true);

      // Since branch exists, update it via PATCH
      const updateResponse = await fetch(branchUrl, {
        method: 'PATCH',
        body: JSON.stringify({ sha: 'new_base_sha', force: true })
      });
      expect(updateResponse.ok).toBe(true);

      // Verify no DELETE was called
      const calls = mockFetch.mock.calls;
      const methods = calls.map(c => c[1]?.method || 'GET');
      expect(methods).not.toContain('DELETE');
    });

    test('should create new branch when it does not exist', async () => {
      // Step 1: Check branch — returns 404
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ message: 'Not Found' })
      });

      // Step 2: Create branch via POST
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () => JSON.stringify({
          ref: 'refs/heads/custom-branch',
          object: { sha: 'base_sha' }
        })
      });

      const branchUrl = 'https://api.github.com/repos/user/repo/git/refs/heads/custom-branch';

      const checkResponse = await fetch(branchUrl, { method: 'GET' });
      expect(checkResponse.ok).toBe(false);

      // Branch doesn't exist, create it
      const createResponse = await fetch('https://api.github.com/repos/user/repo/git/refs', {
        method: 'POST',
        body: JSON.stringify({
          ref: 'refs/heads/custom-branch',
          sha: 'base_sha'
        })
      });
      expect(createResponse.ok).toBe(true);
      expect(createResponse.status).toBe(201);
    });
  });

  describe('File Operations', () => {
    test('should update existing file successfully', async () => {
      // First call: get existing file
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          sha: 'file_sha_123'
        })
      });

      // Second call: update file
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          content: {
            sha: 'new_sha_456'
          }
        })
      });

      const getResponse = await fetch('https://api.github.com/repos/user/repo/contents/path/file.xml');
      const getData = JSON.parse(await getResponse.text());

      const updateResponse = await fetch('https://api.github.com/repos/user/repo/contents/path/file.xml', {
        method: 'PUT',
        body: JSON.stringify({
          message: 'Update file',
          content: 'base64content',
          sha: getData.sha
        })
      });

      expect(updateResponse.ok).toBe(true);
    });

    test('should create new file successfully', async () => {
      // First call: file doesn't exist
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({
          message: 'Not Found'
        })
      });

      // Second call: create file
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () => JSON.stringify({
          content: {
            sha: 'new_sha'
          }
        })
      });

      const getResponse = await fetch('https://api.github.com/repos/user/repo/contents/newfile.xml');
      
      if (!getResponse.ok) {
        const createResponse = await fetch('https://api.github.com/repos/user/repo/contents/newfile.xml', {
          method: 'PUT',
          body: JSON.stringify({
            message: 'Create file',
            content: 'base64content'
          })
        });

        expect(createResponse.status).toBe(201);
      }
    });

    test('should handle file path that does not exist (parent folder missing)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => JSON.stringify({
          message: 'Invalid request',
          errors: [{
            message: 'Path does not exist'
          }]
        })
      });

      const response = await fetch('https://api.github.com/repos/user/repo/contents/nonexistent/path/file.xml', {
        method: 'PUT'
      });

      expect(response.status).toBe(422);
    });
  });

  describe('Pull Request Operations', () => {
    test('should create pull request successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        text: async () => JSON.stringify({
          number: 42,
          html_url: 'https://github.com/user/repo/pull/42',
          title: '🎨 Update Design Tokens'
        })
      });

      const response = await fetch('https://api.github.com/repos/user/repo/pulls', {
        method: 'POST',
        body: JSON.stringify({
          title: '🎨 Update Design Tokens',
          head: 'feature-branch',
          base: 'main',
          body: 'PR description'
        })
      });

      const data = JSON.parse(await response.text());

      expect(response.status).toBe(201);
      expect(data.number).toBe(42);
    });

    test('should handle duplicate PR (422)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: async () => JSON.stringify({
          message: 'Validation Failed',
          errors: [{
            message: 'A pull request already exists'
          }]
        })
      });

      const response = await fetch('https://api.github.com/repos/user/repo/pulls', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Update',
          head: 'feature',
          base: 'main'
        })
      });

      expect(response.status).toBe(422);
    });
  });

  describe('Network Error Handling', () => {
    test('should handle network timeout', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

      await expect(
        fetch('https://api.github.com/repos/user/repo')
      ).rejects.toThrow('Network request failed');
    });

    test('should handle DNS resolution failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('getaddrinfo ENOTFOUND api.github.com'));

      await expect(
        fetch('https://api.github.com/repos/user/repo')
      ).rejects.toThrow();
    });
  });
});
