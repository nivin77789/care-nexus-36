import { Link } from 'react-router-dom';
import { Shield, UserCog, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Care Management System
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose your portal to get started
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Super Admin</CardTitle>
              <CardDescription>Master control panel</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/superadmin/login">
                <Button className="w-full">
                  Access Super Admin
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCog className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Admin Portal</CardTitle>
              <CardDescription>Management dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/login">
                <Button className="w-full">
                  Access Admin Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Client Portal</CardTitle>
              <CardDescription>View your care schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/client/login">
                <Button className="w-full">
                  Access Client Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Carer Portal</CardTitle>
              <CardDescription>Daily care management</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/carer/login">
                <Button className="w-full">
                  Access Carer Portal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
