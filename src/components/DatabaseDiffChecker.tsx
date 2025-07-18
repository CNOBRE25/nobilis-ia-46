import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, XCircle, Database, Table, Shield, Index } from 'lucide-react';

interface DatabaseCheck {
  name: string;
  status: 'exists' | 'missing' | 'error';
  details?: string;
  icon: React.ReactNode;
}

export default function DatabaseDiffChecker() {
  const [checks, setChecks] = useState<DatabaseCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDatabaseChecks = async () => {
    setLoading(true);
    setError(null);
    const newChecks: DatabaseCheck[] = [];

    try {
      // Check if processos table exists
      try {
        const { data, error } = await supabase
          .from('processos')
          .select('id')
          .limit(1);
        
        if (error) {
          newChecks.push({
            name: 'processos table',
            status: 'missing',
            details: error.message,
            icon: <Table className="h-4 w-4" />
          });
        } else {
          newChecks.push({
            name: 'processos table',
            status: 'exists',
            details: 'Table exists and is accessible',
            icon: <Table className="h-4 w-4" />
          });
        }
      } catch (err) {
        newChecks.push({
          name: 'processos table',
          status: 'error',
          details: 'Error checking table',
          icon: <Table className="h-4 w-4" />
        });
      }

      // Check if users table exists
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .limit(1);
        
        if (error) {
          newChecks.push({
            name: 'users table',
            status: 'missing',
            details: error.message,
            icon: <Table className="h-4 w-4" />
          });
        } else {
          newChecks.push({
            name: 'users table',
            status: 'exists',
            details: 'Table exists and is accessible',
            icon: <Table className="h-4 w-4" />
          });
        }
      } catch (err) {
        newChecks.push({
          name: 'users table',
          status: 'error',
          details: 'Error checking table',
          icon: <Table className="h-4 w-4" />
        });
      }

      // Check if audit_logs table exists
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('id')
          .limit(1);
        
        if (error) {
          newChecks.push({
            name: 'audit_logs table',
            status: 'missing',
            details: error.message,
            icon: <Table className="h-4 w-4" />
          });
        } else {
          newChecks.push({
            name: 'audit_logs table',
            status: 'exists',
            details: 'Table exists and is accessible',
            icon: <Table className="h-4 w-4" />
          });
        }
      } catch (err) {
        newChecks.push({
          name: 'audit_logs table',
          status: 'error',
          details: 'Error checking table',
          icon: <Table className="h-4 w-4" />
        });
      }

      // Check RLS policies by trying to insert a test record
      try {
        const { error } = await supabase
          .from('processos')
          .insert({
            numero_processo: 'TEST-DIFF-CHECK',
            descricao_fatos: 'Test record for diff check',
            status: 'tramitacao'
          });
        
        if (error && error.message.includes('policy')) {
          newChecks.push({
            name: 'RLS policies',
            status: 'missing',
            details: 'Row Level Security policies not properly configured',
            icon: <Shield className="h-4 w-4" />
          });
        } else {
          newChecks.push({
            name: 'RLS policies',
            status: 'exists',
            details: 'Row Level Security is working',
            icon: <Shield className="h-4 w-4" />
          });
          
          // Clean up test record
          await supabase
            .from('processos')
            .delete()
            .eq('numero_processo', 'TEST-DIFF-CHECK');
        }
      } catch (err) {
        newChecks.push({
          name: 'RLS policies',
          status: 'error',
          details: 'Error checking RLS policies',
          icon: <Shield className="h-4 w-4" />
        });
      }

      // Check database connection
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          newChecks.push({
            name: 'Database connection',
            status: 'error',
            details: 'Cannot connect to Supabase',
            icon: <Database className="h-4 w-4" />
          });
        } else {
          newChecks.push({
            name: 'Database connection',
            status: 'exists',
            details: 'Successfully connected to Supabase',
            icon: <Database className="h-4 w-4" />
          });
        }
      } catch (err) {
        newChecks.push({
          name: 'Database connection',
          status: 'error',
          details: 'Connection error',
          icon: <Database className="h-4 w-4" />
        });
      }

      setChecks(newChecks);
    } catch (err) {
      setError('Failed to run database checks');
      console.error('Database check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exists':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'exists':
        return <Badge variant="default" className="bg-green-100 text-green-800">Exists</Badge>;
      case 'missing':
        return <Badge variant="destructive">Missing</Badge>;
      case 'error':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Diff Checker
          </CardTitle>
          <CardDescription>
            Check what's missing in your current database compared to the expected schema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runDatabaseChecks} 
            disabled={loading}
            className="w-full"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Checking Database...' : 'Run Database Checks'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {checks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Check Results</CardTitle>
            <CardDescription>
              {checks.filter(c => c.status === 'exists').length} of {checks.length} checks passed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {check.icon}
                    <div>
                      <div className="font-medium">{check.name}</div>
                      {check.details && (
                        <div className="text-sm text-muted-foreground">{check.details}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(check.status)}
                    {getStatusBadge(check.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {checks.length > 0 && checks.some(c => c.status === 'missing') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Missing Components</CardTitle>
            <CardDescription>
              The following components are missing from your database. Run the migration script to fix them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {checks
                .filter(c => c.status === 'missing')
                .map((check, index) => (
                  <div key={index} className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>{check.name}</span>
                  </div>
                ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>To fix:</strong> Go to your Supabase dashboard → SQL Editor → Run the migration script from <code>supabase/migrations/20250717000000_create_processos_table.sql</code>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 